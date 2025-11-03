const form = document.getElementById("ticketForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const count = document.getElementById("count").value;
  const tickets = [];
  if (document.getElementById("A").checked) tickets.push("A");
  if (document.getElementById("B").checked) tickets.push("B");

  const application = { name, count, tickets, status: "pending", entered: false };

  // Replit DB / JSONファイルに保存する場合の疑似コード
  await fetch("/saveApplication", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application)
  });

  alert("申込完了！承認されるまでお待ちください。");
  window.location.href = "/ticket.html";
});

document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const pass = document.getElementById("adminPass").value;
  if (pass !== "YOUR_PASSWORD") return alert("パスワードが違います");
  
  document.getElementById("appList").style.display = "block";

  // Replit DB / JSON から申込情報取得（疑似コード）
  const res = await fetch("/getApplications");
  const apps = await res.json();

  const listDiv = document.getElementById("appList");
  listDiv.innerHTML = "";
  apps.forEach(a => {
    const div = document.createElement("div");
    div.innerHTML = `
      <b>${a.name}</b> / 人数: ${a.count} / チケット: ${a.tickets.join(", ")} / 状態: ${a.status}
      ${a.status === "pending" ? `
      <button onclick='approve("${a.id}")'>承認</button>
      <button onclick='reject("${a.id}")'>非承認</button>` : ""}
    `;
    listDiv.appendChild(div);
  });
});

async function approve(id){ await fetch(`/updateApplication?id=${id}&status=approved`); alert("承認しました"); location.reload();}
async function reject(id){ await fetch(`/updateApplication?id=${id}&status=rejected`); alert("非承認にしました"); location.reload();}

async function loadTicket(){
  // Replit DB / JSON から端末IDに紐づく申込情報取得
  const res = await fetch("/getMyApplication");
  const app = await res.json();

  const div = document.getElementById("ticketInfo");
  if(!app) { div.innerText="申込情報がありません"; return;}
  if(app.status === "pending") { div.innerText="承認待ちです"; return;}
  if(app.status === "rejected") { div.innerText="申し訳ございません。人数の問題で申し込みできませんでした"; return;}
  
  div.innerHTML = `
    代表者名: ${app.name}<br>
    人数: ${app.count}<br>
    チケット: ${app.tickets.join(", ")}<br>
    <canvas id="qrcode"></canvas>
  `;

  // QRコード生成
  new QRCode(document.getElementById("qrcode"), app.id);

  if(!app.entered){
    document.getElementById("enterBtn").style.display="block";
    document.getElementById("enterBtn").onclick = async ()=>{
      await fetch(`/enter?id=${app.id}`);
      alert("入場完了");
      location.reload();
    }
  }  
}

loadTicket();