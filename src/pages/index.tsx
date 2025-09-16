const HomePage = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React Page Lite</title>
        <meta
          name="description"
          content="Static site generator with islands architecture for selective interactivity."
        />
        <link rel="stylesheet" href="./styles.css" />
      </head>
      <body className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center px-4">
        <main className="max-w-4xl w-full">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <span className="text-white font-bold text-3xl">RP</span>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              React Page Lite
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Static sites with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
                islands architecture
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="./demo.html"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                See Interactive Demo →
              </a>
              <a
                href="https://github.com/PedroMarianoAlmeida/reactpagelite"
                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all shadow border border-gray-200"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
              <code className="text-gray-300">{`import { Island } from "@/Island";
import { Counter } from "@/components/Counter";

const HomePage = () => (
  <html lang="en">
    <body>
      <h1>Static Content</h1>

      {/* Add interactivity with islands */}
      <Island>
        <Counter />
      </Island>
    </body>
  </html>
);`}</code>
            </pre>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast by Default</h3>
              <p className="text-sm text-gray-600">
                Static HTML with selective JavaScript. Zero overhead for static content.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow">
              <div className="text-3xl mb-3">🏝️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Islands Architecture</h3>
              <p className="text-sm text-gray-600">
                Interactive components only where you need them.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 mb-2">Deploy Anywhere</h3>
              <p className="text-sm text-gray-600">
                Just static files. Copy to any host, CDN, or server.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>TypeScript • Tailwind CSS • React 19</p>
            <p className="mt-2">This page is 100% static HTML with zero JavaScript</p>
          </div>
        </main>
      </body>
    </html>
  );
};

export default HomePage;
