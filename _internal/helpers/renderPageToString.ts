import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "stream";
import { ReactElement } from "react";
import prettier from "prettier";

export function renderPageToString(element: ReactElement): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = "";
    const stream = new PassThrough();
    stream.on("data", (chunk: Buffer) => {
      html += chunk.toString();
    });
    stream.on("end", async () => {
      try {
        // Format HTML for readable git diffs
        const formatted = await prettier.format(html, {
          parser: "html",
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          htmlWhitespaceSensitivity: "ignore",
        });
        resolve(formatted);
      } catch (error) {
        // If formatting fails, return unformatted HTML
        console.warn("Failed to format HTML, returning unformatted:", error);
        resolve(html);
      }
    });
    stream.on("error", (error: Error) => reject(error));

    const pipeableStream = renderToPipeableStream(element, {
      onShellReady() {
        // The shell is ready; start piping the content
        pipeableStream.pipe(stream);
      },
      onError(error: Error) {
        reject(error);
      },
    });
  });
}