// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item "><a href="overview.html"><strong aria-hidden="true">1.</strong> 总览</a></li><li class="chapter-item "><a href="server_core/server_core.html"><strong aria-hidden="true">2.</strong> Arcaea 服务器核心</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="server_core/login_register.html"><strong aria-hidden="true">2.1.</strong> 注册/登陆</a></li><li class="chapter-item "><a href="server_core/linkplay.html"><strong aria-hidden="true">2.2.</strong> Linkplay</a></li><li class="chapter-item "><a href="server_core/course_mode.html"><strong aria-hidden="true">2.3.</strong> 课题模式</a></li><li class="chapter-item "><a href="server_core/song_download.html"><strong aria-hidden="true">2.4.</strong> 歌曲下载</a></li><li class="chapter-item "><a href="server_core/song_purchase.html"><strong aria-hidden="true">2.5.</strong> 歌曲购买</a></li><li class="chapter-item "><a href="server_core/song.html"><strong aria-hidden="true">2.6.</strong> 歌曲信息</a></li><li class="chapter-item "><a href="server_core/rank.html"><strong aria-hidden="true">2.7.</strong> 排名信息</a></li><li class="chapter-item "><a href="server_core/world.html"><strong aria-hidden="true">2.8.</strong> 世界模式</a></li><li class="chapter-item "><a href="server_core/presents.html"><strong aria-hidden="true">2.9.</strong> 礼物/兑换券</a></li><li class="chapter-item "><a href="server_core/character.html"><strong aria-hidden="true">2.10.</strong> 角色</a></li></ol></li><li class="chapter-item "><a href="web/web.html"><strong aria-hidden="true">3.</strong> 网页</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="web/welcome.html"><strong aria-hidden="true">3.1.</strong> 欢迎页面</a></li><li class="chapter-item "><a href="web/login.html"><strong aria-hidden="true">3.2.</strong> 登陆页面</a></li><li class="chapter-item "><a href="web/panel.html"><strong aria-hidden="true">3.3.</strong> 面板</a></li><li class="chapter-item "><a href="web/best30.html"><strong aria-hidden="true">3.4.</strong> b30查询</a></li><li class="chapter-item "><a href="web/potential.html"><strong aria-hidden="true">3.5.</strong> ptt历史查询</a></li><li class="chapter-item "><a href="web/song_score.html"><strong aria-hidden="true">3.6.</strong> 每首歌的成绩</a></li></ol></li><li class="chapter-item "><a href="forum/forum.html"><strong aria-hidden="true">4.</strong> 论坛</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="forum/forum_index.html"><strong aria-hidden="true">4.1.</strong> 论坛首页</a></li><li class="chapter-item "><a href="forum/posts.html"><strong aria-hidden="true">4.2.</strong> 帖子</a></li><li class="chapter-item "><a href="forum/song_posts.html"><strong aria-hidden="true">4.3.</strong> 位于歌曲下的帖子</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
