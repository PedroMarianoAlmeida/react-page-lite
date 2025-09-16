import { Island } from "@/Island";
import { Counter } from "@/components/Counter";

const DemoPage = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Demo - React Page Lite</title>
        <link rel="stylesheet" href="./styles.css" />
      </head>
      <body className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center px-4">
        <main className="max-w-2xl w-full">
          {/* Back Link */}
          <div className="mb-8">
            <a
              href="./index.html"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              ← Back to Home
            </a>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Interactive Demo
            </h1>
            <p className="text-lg text-gray-600">
              This counter is wrapped in an{" "}
              <code className="bg-white px-2 py-1 rounded border border-gray-200 text-sm">
                &lt;Island&gt;
              </code>{" "}
              making it interactive, while the rest of this page is static HTML.
            </p>
          </div>

          {/* Interactive Counter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl p-12 border border-gray-200 mb-12">
            <Island>
              <Counter />
            </Island>
          </div>

          {/* How it works */}
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
              <span className="text-gray-300 text-sm font-mono">src/pages/demo.tsx</span>
            </div>
            <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
              <code className="text-gray-300">{`import { Island } from "@/Island";
import { Counter } from "@/components/Counter";

const DemoPage = () => (
  <html lang="en">
    <body>
      <h1>Static Content</h1>

      {/* Only this part gets JavaScript */}
      <Island>
        <Counter />
      </Island>
    </body>
  </html>
);`}</code>
            </pre>
          </div>

          {/* Info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>✨ Islands architecture: JavaScript only where you need it</p>
            <p className="mt-2">
              <a
                href="https://github.com/PedroMarianoAlmeida/reactpagelite"
                className="text-blue-600 hover:text-blue-700"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
};

export default DemoPage;
