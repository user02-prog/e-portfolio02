// ═══════════════════════════════════════════════════════════════
//  E-Portfolio — Google Apps Script
//  https://github.com/user01-wq/e-portfolio
// ═══════════════════════════════════════════════════════════════
//
//  วิธีตั้งค่า (ทำครั้งเดียว):
//  1. Project Settings → Script Properties → เพิ่ม 2 ค่า:
//       SUPABASE_URL      = https://xxxx.supabase.co
//       SUPABASE_ANON_KEY = eyJhbG...
//  2. วางเนื้อหาไฟล์ index.html (ที่ build แล้ว) ลงในไฟล์ index.html ของโปรเจค GAS นี้
//  3. Deploy → New deployment → Web app
//       Execute as: Me
//       Who has access: Anyone
//  4. คัดลอก Web app URL → นำไปฝังใน Google Sites
//
//  ตั้ง Trigger ปลุก Supabase (ทำครั้งเดียว):
//  Triggers → เพิ่ม Trigger → keepAlive → Time-driven → Day timer → Every 6 days
// ═══════════════════════════════════════════════════════════════

function doGet() {
  var props = PropertiesService.getScriptProperties()
  var supabaseUrl = props.getProperty('SUPABASE_URL')
  var supabaseKey = props.getProperty('SUPABASE_ANON_KEY')

  // แสดงหน้าแจ้งเตือนถ้ายังไม่ตั้งค่า
  if (!supabaseUrl || !supabaseKey) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:sans-serif;padding:40px;text-align:center">' +
      '<h2>❌ ยังไม่ได้ตั้งค่า Supabase</h2>' +
      '<p>ไปที่ <b>Project Settings → Script Properties</b> แล้วเพิ่ม:</p>' +
      '<ul style="text-align:left;display:inline-block">' +
      '<li><b>SUPABASE_URL</b> = https://xxxx.supabase.co</li>' +
      '<li><b>SUPABASE_ANON_KEY</b> = eyJhbG...</li>' +
      '</ul>' +
      '</div>'
    )
  }

  // อ่านไฟล์ index.html แล้วแทนที่ placeholder ด้วยค่าจริง
  var html = HtmlService.createHtmlOutputFromFile('index').getContent()
  html = html.split('__SUPABASE_URL__').join(supabaseUrl)
  html = html.split('__SUPABASE_ANON_KEY__').join(supabaseKey)

  return HtmlService.createHtmlOutput(html)
    .setTitle('E-Portfolio')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

// ─── ปลุก Supabase ไม่ให้หยุดทำงาน (ตั้ง Trigger ทุก 6 วัน) ───────────────
function keepAlive() {
  var props = PropertiesService.getScriptProperties()
  var supabaseUrl = props.getProperty('SUPABASE_URL')
  var supabaseKey = props.getProperty('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseKey) {
    Logger.log('❌ ยังไม่ได้ตั้งค่า Script Properties')
    return
  }

  try {
    var response = UrlFetchApp.fetch(
      supabaseUrl + '/rest/v1/profiles?select=id&limit=1',
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey
        },
        muteHttpExceptions: true
      }
    )
    Logger.log('✅ Supabase keep-alive: HTTP ' + response.getResponseCode())
  } catch (e) {
    Logger.log('❌ Keep-alive error: ' + e.message)
  }
}
