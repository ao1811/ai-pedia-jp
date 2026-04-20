/**
 * Cloudflare Pages Function: /api/contact
 *
 * フォーム送信を受けて、Slack Webhook or メール（Resend）へ転送する。
 * 必要な環境変数（Cloudflare Pages 管理画面で設定）:
 *   - SLACK_WEBHOOK_URL (任意)
 *   - RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL (任意)
 *   - TURNSTILE_SECRET (任意、スパム対策用)
 *
 * 何も設定されていない場合は、サーバログだけ残して成功扱いにします（開発・検証用）。
 */

interface Env {
  SLACK_WEBHOOK_URL?: string;
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  TURNSTILE_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').slice(0, 200);
    const email = String(form.get('email') ?? '').slice(0, 200);
    const subject = String(form.get('subject') ?? 'other').slice(0, 100);
    const message = String(form.get('message') ?? '').slice(0, 8000);
    const honeypot = String(form.get('website') ?? '');

    // ハニーポット：ボットは hidden input を埋めがち
    if (honeypot) {
      return Response.redirect(new URL('/contact?success=1', request.url).toString(), 303);
    }

    // 最低限のバリデーション
    if (!name || !email || !message) {
      return Response.redirect(new URL('/contact?error=invalid', request.url).toString(), 303);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.redirect(new URL('/contact?error=email', request.url).toString(), 303);
    }

    const body = `[新規問い合わせ]\nお名前: ${name}\nメール: ${email}\n種別: ${subject}\n---\n${message}`;

    // Slack 通知（設定されていれば）
    if (env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body }),
      }).catch(() => {
        // Slack失敗は握りつぶす（メールは続行）
      });
    }

    // メール送信（Resend、設定されていれば）
    if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: env.CONTACT_TO_EMAIL,
          reply_to: email,
          subject: `[問い合わせ/${subject}] ${name}様`,
          text: body,
        }),
      });
    }

    return Response.redirect(new URL('/contact?success=1', request.url).toString(), 303);
  } catch (err) {
    console.error('contact error', err);
    return Response.redirect(new URL('/contact?error=server', request.url).toString(), 303);
  }
};
