// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { describe, it, expect } from "vitest";
import {
  ScenarioRecognizer,
  ScenarioAwareRouter,
} from "../../src/engine/routing/scenario-recognizer.js";
import type { RoutingRequestContext } from "../../src/types/routing.js";

describe("场景识别器测试", () => {
  let recognizer: ScenarioRecognizer;

  beforeEach(() => {
    recognizer = new ScenarioRecognizer();
  });

  describe("代码生成场景", () => {
    it("应该识别代码生成请求", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          { role: "user", content: "帮我写一个快速排序算法" },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("code-generation");
      expect(result.recommendedModel).toBe("claude-3-opus");
      expect(result.reason).toContain("代码");
    });

    it("应该识别包含代码块的请求", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "```javascript\nfunction hello() {\n  console.log('Hello');\n}\n```\n\n请优化这段代码",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("code-generation");
      expect(result.recommendedModel).toBe("claude-3-opus");
    });

    it("应该识别函数定义请求", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "Create a function to calculate fibonacci numbers",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("code-generation");
    });
  });

  describe("复杂推理场景", () => {
    it("应该识别数学问题", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "求解方程：x² + 2x + 1 = 0",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("complex-reasoning");
      expect(result.recommendedModel).toBe("gpt-4-turbo");
      expect(result.reason).toContain("推理");
    });

    it("应该识别逻辑推理请求", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "证明：如果A大于B，B大于C，那么A一定大于C",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("complex-reasoning");
    });
  });

  describe("长文本场景", () => {
    it("应该识别长文本请求", () => {
      const longText = "A".repeat(60000); // 超过 50K 字符

      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: `请总结以下文章：${longText}`,
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("long-context");
      expect(result.recommendedModel).toBe("claude-3-opus-200k");
      expect(result.reason).toContain("长文本");
    });
  });

  describe("创意写作场景", () => {
    it("应该识别写作请求", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "帮我写一篇关于人工智能的科幻小说",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("creative-writing");
      expect(result.recommendedModel).toBe("claude-3-sonnet");
      expect(result.reason).toContain("写作");
    });

    it("应该识别创作诗歌请求", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "创作一首关于春天的诗歌",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("creative-writing");
    });
  });

  describe("简单问答场景", () => {
    it("应该识别简单问答", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "你好，请介绍一下你自己",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("simple-qa");
      expect(result.recommendedModel).toBe("gpt-3.5-turbo");
      expect(result.reason).toContain("简单");
    });

    it("应该识别短文本请求", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "什么是AI？",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("simple-qa");
    });
  });

  describe("通用场景（兜底）", () => {
    it("应该处理未识别的场景", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "随机的一些文字，不匹配任何特定场景",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("general");
      expect(result.recommendedModel).toBe("gpt-4-turbo");
    });
  });

  describe("场景优先级测试", () => {
    it("代码生成应该优先于简单问答", () => {
      // 这个请求既是代码生成，也是简单问答
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "hi", // 简短，但后续会识别为代码
          },
          {
            role: "assistant",
            content: "Hello! How can I help you today?",
          },
          {
            role: "user",
            content: "```python\ndef test():\n  pass\n```",
          },
        ],
      };

      const result = recognizer.recognize(context);

      // 应该识别为代码生成（优先级更高）
      expect(result.scenario).toBe("code-generation");
    });

    it("复杂推理应该优先于通用场景", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "计算积分：∫(0 to 1) x² dx",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("complex-reasoning");
    });
  });

  describe("成本估算测试", () => {
    it("应该正确计算成本节省", () => {
      const router = new ScenarioAwareRouter(recognizer);

      const savings = router["estimateCostSavings"](
        "gpt-4-turbo",
        "gpt-3.5-turbo",
        1000,
        500
      );

      // GPT-4 Turbo: (1000/1000) * 0.01 + (500/1000) * 0.03 = 0.025
      // GPT-3.5 Turbo: (1000/1000) * 0.0005 + (500/1000) * 0.0015 = 0.00125

      expect(savings.originalCost).toBeCloseTo(0.025, 4);
      expect(savings.recommendedCost).toBeCloseTo(0.00125, 4);
      expect(savings.savings).toBeCloseTo(0.02375, 4);
      expect(savings.savingsPercentage).toBeCloseTo(95, 0); // 95% 节省
    });

    it("应该显示不同模型的成本对比", () => {
      const router = new ScenarioAwareRouter(recognizer);

      // 场景：简单问答，推荐使用 GPT-3.5 Turbo
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "你好",
          },
        ],
      };

      const recognition = recognizer.recognize(context);
      const savings = router["estimateCostSavings"](
        "gpt-4-turbo", // 用户原本想用的
        recognition.recommendedModel, // 推荐的模型
        100, // 简单问答，输入 tokens 少
        50
      );

      console.log(`原模型成本: $${savings.originalCost.toFixed(4)}`);
      console.log(`推荐模型成本: $${savings.recommendedCost.toFixed(4)}`);
      console.log(`节省: $${savings.savings.toFixed(4)} (${savings.savingsPercentage.toFixed(1)}%)`);

      expect(savings.savings).toBeGreaterThan(0);
    });
  });

  describe("自定义规则测试", () => {
    it("应该支持添加自定义规则", () => {
      // 添加一个自定义规则：特定关键词使用特定模型
      recognizer.addRule({
        name: "custom-image-analysis",
        priority: 1, // 高优先级
        condition: (context) => {
          const message = context.messages[context.messages.length - 1].content;
          return message.includes("[IMAGE_ANALYSIS]");
        },
        recommendedModel: "gpt-4-vision",
        reason: "图像分析场景，使用 GPT-4 Vision",
      });

      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          {
            role: "user",
            content: "[IMAGE_ANALYSIS] 请分析这张图片",
          },
        ],
      };

      const result = recognizer.recognize(context);

      expect(result.scenario).toBe("custom-image-analysis");
      expect(result.recommendedModel).toBe("gpt-4-vision");
    });

    it("应该支持删除规则", () => {
      const initialRuleCount = recognizer.getRules().length;

      // 添加一个临时规则
      recognizer.addRule({
        name: "temp-rule",
        priority: 10,
        condition: () => false,
        recommendedModel: "gpt-4",
        reason: "临时规则",
      });

      expect(recognizer.getRules().length).toBe(initialRuleCount + 1);

      // 删除规则
      const removed = recognizer.removeRule("temp-rule");

      expect(removed).toBe(true);
      expect(recognizer.getRules().length).toBe(initialRuleCount);
    });
  });

  describe("批量识别测试", () => {
    it("应该支持批量识别场景", () => {
      const contexts: RoutingRequestContext[] = [
        {
          modelName: "gpt-4",
          messages: [{ role: "user", content: "帮我写个函数" }],
        },
        {
          modelName: "gpt-4",
          messages: [{ role: "user", content: "你好" }],
        },
        {
          modelName: "gpt-4",
          messages: [{ role: "user", content: "求解：1+1=?" }],
        },
      ];

      const results = recognizer.recognizeBatch(contexts);

      expect(results).toHaveLength(3);
      expect(results[0].scenario).toBe("code-generation");
      expect(results[1].scenario).toBe("simple-qa");
      expect(results[2].scenario).toBe("complex-reasoning");
    });
  });
});
