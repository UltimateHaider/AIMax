# إعداد Supabase

## 1. تنفيذ المخطط

افتح **Supabase Dashboard → SQL Editor**، والصق محتوى `schema.sql` ثم شغّله.

سيُنشئ:

- `public.user_progress` — تقدم المستخدم لكل درس.
- `public.user_settings` — تفضيلات المستخدم.
- فهارس ومُشغّلات `updated_at`.
- سياسات RLS لكل صف: لا يرى المستخدم إلا بياناته.
- صلاحيات `authenticated` فقط، مع سحب صلاحيات `anon`.

## 2. متغيرات البيئة

انسخ `website/.env.example` إلى `website/.env` ثم املأ:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

هذه القيم عامة ويُسمح بظهورها في المتصفح؛ الحماية الفعلية من RLS.

## 3. تحذير أمني

لا تضع **Secret key** أو **service_role key** في `website/.env` أو أي متغير يبدأ بـ`VITE_`. استخدمه فقط في بيئة خادم موثوقة أو CI، وإذا ظهر في محادثة أو مستودع فبادره بالتدوير من:

**Supabase Dashboard → Project Settings → API → Rotate keys**

## 4. التحقق

بعد التنفيذ، تأكد من:

- وجود الجدولين في **Table Editor**.
- تفعيل **RLS** عليهما.
- وجود 8 سياسات: 4 لكل جدول.
- نجاح تسجيل الدخول لاحقًا مع إرجاع صفوف المستخدم فقط.
