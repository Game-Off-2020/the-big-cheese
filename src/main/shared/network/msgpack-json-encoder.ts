import * as zlib from 'zlib';
import * as msgpack from '@msgpack/msgpack';

export class MsgpackJsonEncoder {
   private static readonly msgpackOptions: msgpack.EncodeOptions = {
      ignoreUndefined: true,
   };

   decode(input: Buffer): unknown {
      const buffer = Buffer.from(input, input.byteOffset, input.byteLength);
      return msgpack.decode(zlib.inflateSync(buffer));
   }

   encode(input: unknown): Buffer {
      const encoded = msgpack.encode(input, MsgpackJsonEncoder.msgpackOptions);
      const buffer = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
      return zlib.deflateSync(buffer);
   }
}
