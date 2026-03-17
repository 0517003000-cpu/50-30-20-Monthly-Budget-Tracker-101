let data = JSON.parse(localStorage.getItem("budgetData")) || {}
let currentMonth = ""
let lang = localStorage.getItem("lang") || "en"

function save(){
localStorage.setItem("budgetData", JSON.stringify(data))
}

function newMonth(){
let name = prompt("Enter month")
if(!name) return

data[name] = {essential:[], non:[], savings:[], budgets:{}}
currentMonth = name
updateMonth()
save()
}

function updateMonth(){
let select = document.getElementById("monthSelect")
select.innerHTML=""

for(let m in data){
let opt = document.createElement("option")
opt.value=m
opt.innerText=m
select.appendChild(opt)
}

select.value=currentMonth
loadData()
}

monthSelect.onchange=function(){
currentMonth=this.value
loadData()
}

function loadData(){
render("essential")
render("non")
render("savings")

let b = data[currentMonth]?.budgets || {}

budgetEssential.innerText = b.essential || ""
budgetNon.innerText = b.non || ""
budgetSavings.innerText = b.savings || ""

setTimeout(calculate, 100) // 🔥 important fix
}

function render(type){
let tbody = document.getElementById(type)
tbody.innerHTML=""

for(let i=0;i<8;i++){
let row = data[currentMonth]?.[type]?.[i] || {}

let tr = document.createElement("tr")
tr.innerHTML=`
<td contenteditable oninput="update('${type}',${i},'name',this.innerText)">${row.name||""}</td>
<td contenteditable oninput="update('${type}',${i},'cost',this.innerText)">${row.cost||""}</td>
<td contenteditable oninput="update('${type}',${i},'note',this.innerText)">${row.note||""}</td>
`
tbody.appendChild(tr)
}
}

function update(type,i,key,val){
data[currentMonth][type][i] = data[currentMonth][type][i] || {}
data[currentMonth][type][i][key]=val
save()
calculate() // 🔥 important
}

function num(x){
return Number((x||"").replace(/\./g,"")) || 0
}

budgetEssential.oninput = saveBudget
budgetNon.oninput = saveBudget
budgetSavings.oninput = saveBudget

function saveBudget(){
data[currentMonth].budgets = {
essential: budgetEssential.innerText,
non: budgetNon.innerText,
savings: budgetSavings.innerText
}
save()
calculate() // 🔥 important
}

function calculate(){
calc("essential","budgetEssential","totalEssential","statusEssential")
calc("non","budgetNon","totalNon","statusNon")
calcSavings()
generateAdvice()
}

function calc(type,budgetId,totalId,statusId){
let total=0

(data[currentMonth]?.[type] || []).forEach(r=>{
total += num(r.cost)
})

document.getElementById(totalId).innerText = total.toLocaleString("id-ID")

let budget = num(document.getElementById(budgetId).innerText)

let status="-"

if(budget > 0){
if(total > budget){
status = lang==="id" ? "Melebihi Anggaran" : "Over Budget"
}
else if(total > budget * 0.85){
status = lang==="id" ? "Anggaran Ketat" : "Tight Budget"
}
else{
status = lang==="id" ? "Di Bawah Anggaran" : "Under Budget"
}
}

document.getElementById(statusId).innerText = status
}

function calcSavings(){
let notes = (data[currentMonth]?.savings || [])
.map(r => (r.note||"").toLowerCase()).join(" ")

let text=""

if(notes.includes("took") || notes.includes("ambil") || notes.includes("pakai")){
text += "⚠️ " + (lang==="id"?"Kamu menggunakan tabungan":"You are using your savings") + "<br>"
}

text += lang==="id"
? "• Menabung minimal 20%<br>• Buat dana darurat"
: "• Save at least 20%<br>• Build emergency fund"

document.getElementById("statusSavings").innerHTML=text
}

function generateAdvice(){
let e = statusEssential.innerText
let n = statusNon.innerText

let text=""

if(e !== "-"){
text += "<b>"+(lang==="id"?"Pengeluaran Penting":"Essential Expenses")+"</b><br>"+adv(e,"essential")+"<br><br>"
}

if(n !== "-"){
text += "<b>"+(lang==="id"?"Pengeluaran Tidak Penting":"Non Essential Expenses")+"</b><br>"+adv(n,"non")
}

adviceText.innerHTML=text
}

function adv(status,type){
let notes = (data[currentMonth]?.[type] || [])
.map(r => (r.note||"").toLowerCase()).join(" ")

let r=""

if(status.includes("Over") || status.includes("Melebihi")){
r += lang==="id"
? "• Kurangi pengeluaran<br>• Fokus kebutuhan utama<br>"
: "• Reduce spending<br>• Focus on needs<br>"
}
else if(status.includes("Tight") || status.includes("Ketat")){
r += lang==="id"
? "• Anggaran hampir habis<br>"
: "• Budget almost full<br>"
}
else if(status.includes("Under") || status.includes("Bawah")){
r += lang==="id"
? "• Bagus! Pertahankan<br>"
: "• Good job! Keep it up<br>"
}

if(notes.includes("shopping")){
r += lang==="id"?"• Kurangi belanja<br>":"• Reduce shopping<br>"
}
if(notes.includes("bill")){
r += lang==="id"?"• Hemat listrik/air<br>":"• Save utilities<br>"
}

return r
}

function changeLang(){
lang = language.value
localStorage.setItem("lang", lang)
applyLanguage()
calculate()
}

function applyLanguage(){
if(lang==="id"){
title.innerText="Pelacak Anggaran Bulanan"
adviceTitle.innerText="Saran Keuangan"
}else{
title.innerText="Monthly Budget Tracker"
adviceTitle.innerText="Budget Advice"
}
}

window.onload = function(){
language.value = lang
applyLanguage()

if(Object.keys(data).length>0){
currentMonth = Object.keys(data)[0]
updateMonth()
}
}
