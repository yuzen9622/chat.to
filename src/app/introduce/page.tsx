import {
  Search,
  Users,
  MessageCircle,
  Shield,
  Settings,
  Edit3,
  ExternalLink,
  Phone,
  FileText,
  Bot,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/chat.png"
              alt="chat.to"
              className="w-8 h-8"
              width={32}
              height={32}
            />
            <span className="text-2xl font-bold text-gray-900">chat.to</span>
          </div>
          <div className="items-center hidden space-x-6 md:flex">
            <Link
              href="#features"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              功能特色
            </Link>
            <Link
              href="#tech"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              技術棧
            </Link>
            <Link
              href="#roadmap"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              開發路線
            </Link>
            <Link
              href="https://chat-to-sage.vercel.app/chat"
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              立即開始
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container px-4 py-20 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
            💬 現代即時聊天
          </span>
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-7xl">
            你會喜愛的
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              現代線上即時聊天應用
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-600">
            Chat.to
            是一款簡潔、即時的聊天應用程式，讓你能輕鬆與朋友和群組連線。透過現代技術棧提供流暢、安全且富有互動性的訊息體驗。
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="https://chat-to-sage.vercel.app/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              立即體驗
            </Link>
            <button className="px-6 py-3 text-lg font-medium text-gray-700 transition-colors border border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-900">
              了解更多
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container px-4 py-20 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">功能特色</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            提供完整的即時聊天功能，讓您的溝通更加順暢和有趣
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-xl">
            <Search className="w-12 h-12 mb-4 text-blue-500" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              好友搜尋
            </h3>
            <p className="text-gray-600">輕鬆搜尋並新增好友，擴展您的社交圈</p>
          </div>

          <div className="p-6 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-xl">
            <Users className="w-12 h-12 mb-4 text-green-500" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              群組聊天
            </h3>
            <p className="text-gray-600">建立或加入群組對話，與多人同時交流</p>
          </div>

          <div className="p-6 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-xl">
            <MessageCircle className="w-12 h-12 mb-4 text-purple-500" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              即時通訊
            </h3>
            <p className="text-gray-600">
              基於 Ably 提供順暢且即時的訊息傳遞體驗
            </p>
          </div>

          <div className="p-6 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-xl">
            <Shield className="w-12 h-12 mb-4 text-red-500" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              安全認證
            </h3>
            <p className="text-gray-600">
              使用 NextAuth，支援 JWT 與 OAuth 第三方登入
            </p>
          </div>

          <div className="p-6 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-xl">
            <Settings className="w-12 h-12 mb-4 text-orange-500" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              群組管理
            </h3>
            <p className="text-gray-600">
              可建立、更新與刪除聊天室群組，完全掌控
            </p>
          </div>

          <div className="p-6 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-xl">
            <Edit3 className="w-12 h-12 mb-4 text-indigo-500" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              彈性訊息功能
            </h3>
            <p className="text-gray-600">
              支援傳送、編輯與刪除訊息，還可回覆特定訊息
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">技術棧</h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              採用最新且穩定的技術打造，確保最佳的使用體驗
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 text-center transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <Image
                width={60}
                height={60}
                src="/logo/nextjs-icon.svg"
                alt="Next.js"
                className="w-10 h-10 mx-auto mb-3"
              />
              <h3 className="mb-2 font-semibold text-black">Next.js</h3>
              <p className="text-sm text-gray-600">前後端框架</p>
            </div>
            <div className="p-6 text-center transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <Image
                width={60}
                height={60}
                src="/logo/ably-icon.png"
                alt="Ably"
                className="w-10 h-10 mx-auto mb-3 rounded-full"
              />
              <h3 className="mb-2 font-semibold text-black">Ably</h3>
              <p className="text-sm text-gray-600">即時通訊服務</p>
            </div>
            <div className="p-6 text-center transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <Image
                width={60}
                height={60}
                src="/logo/supabase-icon.png"
                alt="Supabase"
                className="w-10 h-10 mx-auto mb-3"
              />
              <h3 className="mb-2 font-semibold text-black">Supabase</h3>
              <p className="text-sm text-gray-600">資料庫</p>
            </div>
            <div className="p-6 text-center transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <svg
                className="w-10 h-10 mx-auto mb-3"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zm0 3.6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2z"
                  fill="#7C3AED"
                />
              </svg>
              <h3 className="mb-2 font-semibold text-black">NextAuth.js</h3>
              <p className="text-sm text-gray-600">使用者認證</p>
            </div>
            <div className="p-6 text-center transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <svg
                className="w-10 h-10 mx-auto mb-3"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M12 0L24 20H0L12 0z" fill="#000" />
              </svg>
              <h3 className="mb-2 font-semibold text-black">Vercel</h3>
              <p className="text-sm text-gray-600">部署平台</p>
            </div>
            <div className="p-6 text-center transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <Image
                width={60}
                height={60}
                src="/logo/cloudinary-icon.jpeg"
                alt="Cloudinary"
                className="w-10 h-10 mx-auto mb-3 rounded"
              />
              <h3 className="mb-2 font-semibold text-black">Cloudinary</h3>
              <p className="text-sm text-gray-600">雲端檔案儲存</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="container px-4 py-20 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">開發路線</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            即將推出的精彩功能，讓聊天體驗更加豐富
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="p-6 transition-colors bg-white border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400">
            <Phone className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              語音/視訊通話
            </h3>
            <p className="text-gray-500">支援高品質的語音和視訊通話功能</p>
          </div>

          <div className="p-6 transition-colors bg-white border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400">
            <FileText className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              Markdown 格式訊息
            </h3>
            <p className="text-gray-500">
              支援 Markdown 語法，讓訊息格式更豐富
            </p>
          </div>

          <div className="p-6 transition-colors bg-white border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400">
            <Bot className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              AI 訊息產生器
            </h3>
            <p className="text-gray-500">AI 協助生成和優化您的聊天內容</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 text-white bg-blue-600">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold">即時</div>
              <div className="text-blue-100">訊息傳遞</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">安全</div>
              <div className="text-blue-100">認證系統</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">現代</div>
              <div className="text-blue-100">技術棧</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">開源</div>
              <div className="text-blue-100">MIT 授權</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold">準備開始聊天了嗎？</h2>
          <p className="mb-8 text-xl opacity-90">
            立即體驗 chat.to，享受現代化的即時聊天體驗
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="https://chat-to-sage.vercel.app/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-blue-600 transition-colors bg-white rounded-md hover:bg-gray-100"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              立即體驗
            </Link>
            <Link
              href="https://github.com/yuzen9622/chat.to"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white transition-colors border border-white rounded-md hover:bg-white hover:text-blue-600"
            >
              查看原始碼
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center mb-4 space-x-2">
                <Image
                  src="/chat.png"
                  width={36}
                  height={36}
                  alt="chat.to"
                  className="w-6 h-6"
                />
                <span className="text-xl font-bold">chat.to</span>
              </div>
              <p className="text-gray-400">你會喜愛的現代線上即時聊天應用。</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">產品</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#features"
                    className="transition-colors hover:text-white"
                  >
                    功能特色
                  </Link>
                </li>
                <li>
                  <Link
                    href="#tech"
                    className="transition-colors hover:text-white"
                  >
                    技術棧
                  </Link>
                </li>
                <li>
                  <Link
                    href="#roadmap"
                    className="transition-colors hover:text-white"
                  >
                    開發路線
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">連結</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="https://chat-to-sage.vercel.app/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    立即體驗
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/yuzen9622/chat.to"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">授權</h4>
              <ul className="space-y-2 text-gray-400">
                <li>MIT License</li>
                <li>開源專案</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 text-center text-gray-400 border-t border-gray-800">
            <p>&copy; 2024 chat.to. 採用 MIT License 授權。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
