# Playground 方向
参考 https://labs.google/playground 专属样式：黑底、像素标题、蓝色沉浸式首屏、细横线和游戏发现区。此前通用浅色样式不适用。
色板：纯黑 #000000、面板 #121212、分隔 #303030、白 #FFFFFF、次级 #A8ADB8、蓝 #658AFF。
字体：Segoe UI / Microsoft YaHei；首屏自制 5×7 像素字形 SVG。
布局：顶部品牌与操作 / 横向导航 / 满幅首屏 / 推荐游戏 / 游戏发现。内容区管理表格保持紧凑。
审查：不能只换色；移除固定侧栏，以真实游戏截图构成沉浸式首屏。像素标题是唯一强装饰。截图明确标注，不使用 Google 标识、文案或媒体。各管理入口保留。
验证：桌面及390/768px八页无溢出、筛选空态、两款游戏试玩、首屏探索入口和默认路由。


## GDevelop 参考调整
参考 https://gdevelop.io/zh-cn ：美术首屏、大标题、作品展示。采用原创浮岛场景，左侧标题右侧场景；撤掉像素标题和悬浮截图。游戏卡片去掉外框，封面全幅展示，详情中保留完整截图。桌面四列，手机两列。
背景资源：web/assets/game-world-hero.png。由内置 Imagegen 生成，无 CLI。动画为 CSS 镜头缓移与粒子，不是生成的视频；支持暂停及减少动态效果。数据不变时跳过定时重绘，避免动画反复重启。
生成提示词：Create a premium wide landscape website hero illustration, 16:9. Original art for a playful indie game discovery platform. Beautiful polished 3D stylized fantasy adventure world, sculpted organic terrain and lush teal vegetation, floating islands, luminous waterfalls pouring into cloud mist, a tiny inviting village with warm golden windows, a winding stone trail toward a large glowing portal at far right. Sophisticated art direction and tactile materials, rich indigo twilight sky, lavender highlights, turquoise water, warm peach accent light. Cinematic depth, high quality contemporary game key art, graceful curves and atmospheric perspective. Composition: LEFT 45 percent mostly calm dark indigo sky and soft distant clouds, very low detail there to allow white Chinese headline overlay; all detailed islands and village on RIGHT 55 percent, extending toward bottom right. No text, no lettering, no logos, no UI, no pixel art, no low-poly triangles, no geometric mountain illustration. Image should feel inviting and wondrous, not dark or ominous. Render as one complete full-bleed scene, not a mockup.

### 最终背景修订
用户要求无古代 / 中国风，采用现代科幻太空游乐园、机器人与悬浮赛道。素材 web/assets/game-world-modern.png，内置 Imagegen 生成。页面以48%不透明度、低饱和度、深蓝紫遮罩呈现；手机38%。保留动态镜头和暂停。
最终提示词：Wide 16:9 premium website hero key art for a modern casual game discovery platform. A playful contemporary science-fiction world, polished high-end stylized 3D game rendering. On the RIGHT half: an imaginative floating futuristic amusement park in space, smooth white and cobalt modular platforms, neon cyan and coral looping racing tracks, a few small rounded robot characters, glass-domed space station, glowing energy rings, tiny sleek racing vehicles, planets and soft nebula far behind. Crisp designed silhouettes, beautiful tactile materials, cinematic lighting, joyful accessible gaming mood. NOT dystopian. Deep navy and violet space background with luminous aqua, lilac and warm orange accents. LEFT 45% is calm dark navy space with subtle atmospheric haze, empty of main objects, designed for legible white headline overlay. Composition wide and coherent, major action on right and lower right. Absolutely NO castles, temples, pagodas, traditional roofs, ancient buildings, fantasy medieval villages, Chinese or East Asian architectural motifs. No text, no logos, no UI, no pixels. Modern futuristic arcade adventure, not historical fantasy. Highly polished professional game promotional artwork, not an abstract gradient or vector illustration.

### 最终采用：简洁 Playground 方向
用户否决复杂场景。首页不再引用两张生成图，也不再使用雪山插画。当前为黑底、两侧低透明度实机截图、居中文字和缓慢蓝色光晕；手机降低图片透明度。保留卡片轻边框及自动最新排序。

### 简化背景最终替换
仅保留深色留白与一条半透明蓝紫光带，撤掉首屏截图拼贴。资源 web/assets/hero-minimal-light.png，内置 Imagegen。
提示词：Minimal abstract background image for an elegant game website, wide 16:9 composition. Almost black charcoal navy canvas, 85 percent quiet negative space. Just ONE delicate translucent satin-like blue-violet ribbon of light curving gently along the bottom right edge, and a very faint soft blue haze at the lower left edge. Sophisticated optical glass material, restrained photographic studio lighting, smooth continuous tones, subtle depth. Center and entire upper half are empty dark space for white heading. Very simple, understated, premium, low contrast. No objects, no landscape, no buildings, no characters, no planets, no stars, no sparkles, no game controllers, no screenshots, no text, no logo, no UI. Do not create a busy wave pattern, no multiple overlapping ribbons, no bright neon. A single soft flowing light form on a dark empty background.

### 当前采用：原创游戏群岛 + 原版像素字标
以 Playground 官方首屏海岛海报为构图研究，未直接使用其图。原创图 web/assets/hero-game-islands.png 由内置 Imagegen 生成；三座简洁岛屿、海面及云朵，现代街机亭和赛道，避开古代建筑。Game Lab 恢复用户截图指定的 web/assets/game-lab.svg 像素字标。背景约50%不透明度，慢速镜头动画可暂停。
生成提示词：Original wide 16:9 hero background for a playful game platform. Refined 2D pixel-art game world map viewed in gentle isometric perspective, three modest islands in a vast calm cobalt and turquoise sea, soft white clouds near the outer edges. Keep composition simple and airy with generous open water across the center for a large title overlay. Left lower island: green grass, a handful of round trees, a tiny colorful modern arcade pavilion. Right lower island: a curving orange racing track, a few small blocky racing cars and clean modern paddock. A smaller distant island upper right: snowy slopes and two pine trees, no castle. One tiny yellow balloon far upper left. Islands connected by a single light bridge low in composition. Fine tasteful pixel art, restrained detail, clear readable silhouettes, harmonious blue, mint green, pale lavender and small warm orange accents. Light whimsical videogame map, not photorealistic or 3D cinematic. No dense central city, no temples, no castles, no ancient buildings, no Chinese architecture, no neon space city, no complex machines, no text, no logos, no UI. Scene forms a simple expansive backdrop, not a crowded illustration. Use an original island layout and structures.

### 本轮 Frontend Design 排版计划
沿用像素字与明亮群岛底图，不重新设计视觉主题。色板：画布 #08080C、面板 #121219、白字 #F2F2F5、次字 #A5A1B5、蓝影 #243F98。像素字仅用于主字标，正文继续 Segoe UI / Microsoft YaHei。
布局：顶部导航 → 440px 首屏 → 紧凑最新游戏横条 → 筛选与四列游戏。各区左边缘对齐，主区间距24–30px，卡片列间距20px。
对照用户意见：首屏高度和重复段落的留白是主因，不通过新增装饰解决。缩小字标、推荐图和卡片封面高度，手机仍保持两列和足够的按钮触达尺寸。
