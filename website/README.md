# هندسة الذكاء الاصطناعي من الصفر — موقع VitePress

موقع توثيق عربي تفاعلي لمنهج **AI Engineering from Scratch**: 20 مرحلة و435 درسًا في الرياضيات وتعلّم الآلة والتعلّم العميق والنماذج اللغوية الكبيرة والوكلاء والبنية التحتية.

## ما الذي يميّز الموقع؟

- واجهة عربية RTL مع دعم كامل للوضع الليلي والنهاري.
- بحث محلي في عناوين الدروس ومحتواها، مع اقتراحات وآخر عمليات البحث.
- تتبّع تقدم لكل درس ومرحلة محفوظ في `localStorage`.
- اختبارات تفاعلية بعد الدروس مع تصحيح وشرح.
- خريطة مسار تفاعلية وثلاثة مسارات مقترحة.
- تحويل تلقائي لصيغ رياضية شائعة إلى KaTeX عند ظهورها في الشاشة.
- صفحات مراحل مستقلة تعمل كصفحات هبوط قابلة للفهرسة.

## البنية

```text
ai-engineering-from-scratch/
├── curriculum.json              # مصدر الحقيقة: 20 مرحلة و435 درسًا
├── phases/                     # المحتوى الأصلي (لا يُعدّل من الموقع)
├── scripts/
│   ├── sync_content.py         # مزامنة الدروس والاختبارات والـ sidebar
│   ├── generate_phase_pages.py # توليد صفحات المراحل من curriculum.json
│   ├── generate_sitemap.py     # توليد sitemap.xml وrobots.txt
│   └── run_python.cjs          # تشغيل Python عبر المنصات
└── website/
    ├── package.json
    └── docs/
        ├── index.md
        ├── roadmap.md
        ├── about.md
        ├── phases/             # دروس مُولّدة + صفحات المراحل
        ├── public/             # sitemap.xml، robots.txt، favicon، أصول ثابتة
        └── .vitepress/         # الإعدادات، الثيم، المكونات، TECH_DEBT.md
```

## المتطلبات

- Node.js 20 أو أحدث.
- Python 3.10 أو أحدث **اختياري**: مطلوب فقط عند تحديث المحتوى وتشغيل `docs:generate` محليًا. البناء والنشر لا يحتاجان Python.

## التشغيل محليًا

من جذر المستودع:

```bash
cd website
npm install
npm run docs:dev
```

يفتح VitePress الخادم على `http://localhost:5173` افتراضيًا. صفحات المراحل وsitemap موجودة مسبقًا في المستودع، لذا لا يحتاج التشغيل اليومي إلى Python.

## البناء

```bash
cd website
npm run docs:build
```

الناتج في `website/docs/.vitepress/dist`. الأمر يشغّل `vitepress build docs` فقط، ولا يستدعي Python. هذا هو المسار الذي يستخدمه Vercel.

إذا عدّلت `curriculum.json` أو أضفت/حذفت دروسًا، حدّث الملفات المولّدة محليًا ثم التزم بها:

```bash
cd website
npm run docs:generate
npm run docs:build
git add docs/phases docs/public/sitemap.xml docs/public/robots.txt
```

`docs:generate` يشغّل:

1. `scripts/generate_phase_pages.py` — يولّد 20 صفحة مرحلة.
2. `scripts/generate_sitemap.py --strict` — يولّد `sitemap.xml` و`robots.txt` ويفشل إذا كانت صفحة مطلوبة مفقودة.

لمعاينة الناتج:

```bash
npm run docs:preview
```

## مزامنة المحتوى

من جذر المستودع:

```bash
python scripts/sync_content.py
```

يقوم السكربت بنسخ `docs/en.md` من `phases/` إلى `website/docs/phases/` مع إضافة الـfrontmatter، ونسخ الأصول والاختبارات، وإعادة توليد `sidebar.ts` والـlanding page. **لا تعدّل ملفات `phases/` الأصلية لتغيير الموقع**؛ عدّل قالب الموقع أو المكونات بدلًا من ذلك.

## SEO وrobots

- `sitemap.xml` يغطي: الرئيسية، `/roadmap`، `/about`، 20 صفحة مرحلة، و435 درسًا = **458 URL**.
- `robots.txt` يسمح بكل الصفحات ويشير إلى sitemap.
- كل صفحة تحصل على `description` و`canonical` وOpen Graph وTwitter Card عبر `transformPageData` و`transformHead` في `docs/.vitepress/config.mts`.
- عنوان كل درس يتضمن اسم المرحلة لضمان تفرده.

لتغيير النطاق الأساسي (مثلًا أثناء النشر على نطاق مختلف):

```bash
SITE_URL=https://example.com npm run docs:build
```

على Windows PowerShell:

```powershell
$env:SITE_URL = "https://example.com"; npm run docs:build
```

يجب أن يتطابق النطاق مع النطاق الفعلي للنشر حتى تكون روابط canonical وsitemap صحيحة.

## الجودة وإمكانية الوصول

نتائج Lighthouse (mobile، نسخة `dist`):

| الصفحة | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| الرئيسية | 100 | 100 | 100 | 100 |
| درس | 100 | 100 | 100 | 100 |
| `/roadmap` | 98 | 100 | 100 | 100 |

- تدقيق Lighthouse على الرئيسية ودرس و`/roadmap`.
- فحص تباين الألوان في الوضعين الفاتح والداكن.
- دعم Tab و`:focus-visible` بلون Pêche، وإغلاق البحث والقوائم بـ`Escape`.
- أهداف لمس مناسبة، و`aria-label` للأزرار الأيقونية، و`aria-current` للتنقل النشط.
- تفاصيل الدين التقني ونتائج القياس في [`docs/.vitepress/TECH_DEBT.md`](docs/.vitepress/TECH_DEBT.md).

## النشر

الموقع ثابت بالكامل. ارفع محتويات `website/docs/.vitepress/dist` إلى أي استضافة ثابتة (Vercel، Netlify، Cloudflare Pages، GitHub Pages). فعّل إعادة الكتابة إلى `index.html` فقط إذا كنت تستخدم توجيه SPA؛ VitePress يولّد صفحات HTML فعلية لكل مسار، لذا لا تحتاج إلى ذلك عادة.

> ملاحظة: `vercel.json` في جذر المستودع يخص الموقع القديم في `site/` وليس موقع VitePress. إعداد النشر الخاص بـVitePress يجب أن يشير إلى `website` كجذر للمشروع و`npm run docs:build` كأمر بناء و`website/docs/.vitepress/dist` كمجلد الناتج.

## الترخيص

ترخيص **MIT**. نصوص المنهج الأصلية من مستودع [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch). نسخة العمل العربية في [UltimateHaider/ai-engineering-from-scratch](https://github.com/UltimateHaider/ai-engineering-from-scratch).
