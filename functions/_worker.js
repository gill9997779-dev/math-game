// Cloudflare Pages Worker - 确保静态文件正常服务
// 注意：这个 worker 不应该拦截静态文件请求
// 如果存在这个文件，它会拦截所有请求，包括静态文件
// 因此我们需要确保静态文件请求被正确转发

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 对于 API 请求，让 Pages Functions 处理（它们会自动处理）
    // 对于静态文件（HTML, JS, CSS, 图片等），不拦截，让 Pages 正常服务
    // 实际上，对于静态文件，我们不应该在这里处理
    
    // 如果路径是根路径或 index.html，确保返回正确的 HTML
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // 让 Pages 正常处理，不拦截
      return fetch(request);
    }
    
    // 对于所有其他请求（包括静态资源），直接转发
    return fetch(request);
  }
};

