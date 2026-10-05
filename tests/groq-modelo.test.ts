import { describe, expect, it } from "vitest";
import { elegirModeloDeLista, MODELO_POR_DEFECTO } from "@/lib/groq";

describe("elegirModeloDeLista", () => {
  it("prefiere gpt-oss-120b y excluye whisper/guard", () => {
    expect(
      elegirModeloDeLista(["whisper-large-v3", "meta-llama/llama-guard-4-12b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"]),
    ).toBe("openai/gpt-oss-120b");
  });
  it("cae a qwen si no hay gpt-oss", () => {
    expect(elegirModeloDeLista(["whisper-large-v3", "qwen/qwen3.6-27b", "llama-guard-3-8b"])).toBe("qwen/qwen3.6-27b");
  });
  it("el default documentado es un modelo actual", () => {
    expect(MODELO_POR_DEFECTO).toBe("openai/gpt-oss-120b");
  });
});
