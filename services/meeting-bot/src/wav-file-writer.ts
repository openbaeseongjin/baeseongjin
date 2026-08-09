import { createWriteStream, promises as fs } from "node:fs";
import { Writable, type WritableOptions } from "node:stream";
import { finished } from "node:stream/promises";

const HEADER_SIZE = 44;

function wavHeader(dataLength: number): Buffer {
  const header = Buffer.alloc(HEADER_SIZE);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(16_000, 24);
  header.writeUInt32LE(16_000 * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

export class WavFileWriter extends Writable {
  private readonly output;
  private dataLength = 0;

  constructor(
    private readonly filePath: string,
    options?: WritableOptions,
  ) {
    super(options);
    this.output = createWriteStream(filePath);
    this.output.on("error", (error) => this.destroy(error));
    this.output.write(Buffer.alloc(HEADER_SIZE));
  }

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.dataLength += chunk.length;
    if (this.output.write(chunk)) {
      callback();
      return;
    }
    this.output.once("drain", callback);
  }

  override _final(callback: (error?: Error | null) => void): void {
    this.output.end();
    void finished(this.output)
      .then(async () => {
        const handle = await fs.open(this.filePath, "r+");
        try {
          await handle.write(wavHeader(this.dataLength), 0, HEADER_SIZE, 0);
        } finally {
          await handle.close();
        }
      })
      .then(() => callback())
      .catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }

  override _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
    this.output.destroy();
    callback(error);
  }
}
