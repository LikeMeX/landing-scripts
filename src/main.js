function init() {
  const userAgent = appendUserAgent();
  console.log("test init script", "userAgent", userAgent);
}
//   (function(){
//     const fields = ["email","phone","name","price","course","campaign","seller","px","redirect_url","callback_url","params","discountCode"]
//     clearData(fields)
//     const deal_id = genDealID();
//     appendUserAgent();
//     document.querySelector('input[name="deal_id"]').value = deal_id
//     function genDealID(){
//       var d = new Date().toISOString().substring(0, 10);
//       var dd = d.split('-').join('');
//       var rand = Math.round(Math.random()*1000000);
//       return dd+rand;
//     }
//     function clearData(fields){
//       fields.map((field)=>{
//         localStorage.setItem(field,"");
//       })
//     }
//   })()

function test() {
  console.log("test script");
}

function listenerForm() {
  document.body.addEventListener(
    "submit",
    (event) => {
      const formData = new FormData(event.target);
      const formProps = Object.fromEntries(formData);
      const name = correctName(formProps.name);
      const course = formProps.course.trim().split("/");
      const info = formProps.info.trim().split("/");
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const phone = validatePhone(formProps.phone);
      if (formProps.orderbump && formProps.orderbumpdetail) {
        course[0] += `,${formProps.orderbumpdetail.trim()}`;
      }
      if (!phone) {
        alert("กรุณากรอกข้อมูลสำหรับติดต่อให้ถูกต้อง");
        event.preventDefault();
        return false;
      }
      localStorage.setItem("email", formProps.email);
      localStorage.setItem("phone", phone);
      localStorage.setItem("name", name);
      localStorage.setItem("price", formProps.price);
      localStorage.setItem("course", course[0]);
      localStorage.setItem("campaign", info[1]);
      localStorage.setItem("seller", info[0]);
      localStorage.setItem("deal_id", formProps.deal_id);
      localStorage.setItem("px", formProps.px);
      localStorage.setItem("redirect_url", formProps.redirect_url);
      localStorage.setItem("params", JSON.stringify(params));
    },
    false
  );
}

function validatePhone(phone) {
  if (!phone) return false;
  phone = phone.replace(/(\s+|-|\+66|^66|^0)/g, "0");
  if (phone.length !== 10) return false;
  return phone;
}
function correctName(name) {
  name = name
    .replace(/^(นาย|นางสาว|น.ส.|ด.ช.|นาง|คุณ |เด็กชาย|เด็กหญิง)/g, "")
    .replace(/\s\s+/g, " ")
    .trim();
  return name;
}

function appendUserAgent() {
  const l = location;
  const px =
    PXID +
    "|" +
    navigator.userAgent +
    "|" +
    l.protocol +
    "//" +
    l.host +
    l.pathname;
  return px;
  //   document.querySelector('input[name="px"]').value = px;
  //  $px = $("input[name='px']");
  // if(!$px || !PXID) return false;
  // $px.val(PXID + '|' + navigator.userAgent + '|' + l.protocol+'//'+l.host+l.pathname);
}
