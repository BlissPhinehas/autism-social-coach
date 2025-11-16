// src/utils.ts
import type { UIMessage, UIMessageStreamWriter, ToolSet, ToolCallOptions } from "ai";
import { convertToModelMessages, isToolUIPart } from "ai";
import { APPROVAL } from "./shared";

function isValidToolName<K extends PropertyKey, T extends object>(
    key: K,
    obj: T
): key is K & keyof T {
    return key in obj;
}

/**
 * Processes tool calls where human approval is needed
 */
export async function processToolCalls<Tools extends ToolSet>({
    dataStream,
    messages,
    executions
}: {
    tools?: Tools;
    dataStream: UIMessageStreamWriter;
    messages: UIMessage[];
    executions: Record<string, (args: any, context: ToolCallOptions) => Promise<unknown>>;
}): Promise<UIMessage[]> {
    const processedMessages = await Promise.all(
        messages.map(async (message) => {
            const parts = message.parts;
            if (!parts) return message;

            const processedParts = await Promise.all(
                parts.map(async (part) => {
                    if (!isToolUIPart(part)) return part;

                    const toolName = part.type.replace("tool-", "") as keyof typeof executions;

                    if (!(toolName in executions) || part.state !== "output-available") return part;

                    let result: unknown;

                    if (part.output === APPROVAL.YES) {
                        if (!isValidToolName(toolName, executions)) return part;
                        result = await executions[toolName](part.input, { messages: convertToModelMessages(messages), toolCallId: part.toolCallId });
                    } else if (part.output === APPROVAL.NO) {
                        result = "User denied execution";
                    } else return part;

                    dataStream.write({
                        type: "tool-output-available",
                        toolCallId: part.toolCallId,
                        output: result
                    });

                    return { ...part, output: result };
                })
            );

            return { ...message, parts: processedParts };
        })
    );

    return processedMessages;
}

/**
 * Remove incomplete tool calls
 */
export function cleanupMessages(messages: UIMessage[]): UIMessage[] {
    return messages.filter((message) => {
        if (!message.parts) return true;
        return !message.parts.some((part) => isToolUIPart(part) && (part.state === "input-streaming" || (part.state === "input-available" && !part.output && !part.errorText)));
    });
}
