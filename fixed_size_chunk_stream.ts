/**
 * A TransformStream that will collect & enqueue chunk in fixed size.
 */
export class FixedSizeChunkStream extends TransformStream {
  constructor(chunkSize: number) {
    let buffer = new Uint8Array();
    let totalSize = 0;

    super({
      transform(chunk, controller) {
        const newBuffer = new Uint8Array(buffer.length + chunk.length);
        newBuffer.set(buffer, 0);
        newBuffer.set(chunk, buffer.length);
        buffer = newBuffer;
        totalSize += chunk.length;

        // If the accumulated buffer reaches `chunkSize` or more, emit a chunk
        if (totalSize >= chunkSize) {
          const outputChunk = buffer.slice(0, chunkSize);
          controller.enqueue(outputChunk);
          buffer = buffer.slice(chunkSize);
          totalSize -= chunkSize;
        }
      },

      flush(controller) {
        // If there's any remaining data in the buffer after processing all chunks
        if (buffer.length > 0) {
          controller.enqueue(buffer);
          buffer = new Uint8Array();
          totalSize = 0;
        }
      },
    });
  }
}
