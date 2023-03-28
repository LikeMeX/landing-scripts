// ================ example use init script =================
// (function () {
//   const arguments = {
//     PXID,
//     clearDataFields: ['email','phone','name','price','course','campaign','seller','px','redirect_url','callback_url','params','discountCode']
//   };
//   const {userAgent, dealId} = init(arguments,()=>{
//     window.dataLayer = window.dataLayer || [];
//     window.dataLayer.push({'event':'FSInit', 'PXID': PXID});
//     fbq('init',  PXID);
//     fbq('track', 'PageView');
//   });
//   var dealIdElements =  document.getElementsByName("deal_id")
//   var pxElements =  document.getElementsByName("px")
//   for (const dealIdElement of dealIdElements) {
//     dealIdElement.value = userAgent
//   }
//   for (const pxElement of pxElements) {
//     pxElement.value = userAgent
//   }
// })()
// ================ example use init =================
function init(arguments, callback) {
  const userAgent = appendUserAgent(arguments.PXID);
  const dealId = genDealId();
  clearDataLocalStorage(arguments.clearDataFields);
  if (callback) callback();
  return {
    userAgent,
    dealId,
  };
}

function genDealId() {
  var d = new Date().toISOString().substring(0, 10);
  var dd = d.split('-').join('');
  var rand = Math.round(Math.random() * 1000000);
  const deal_id = dd + rand;
  return deal_id;
}

function clearDataLocalStorage(fields) {
  fields.map(field => {
    localStorage.setItem(field, '');
  });
}

function listenerForm() {
  document.body.addEventListener(
    'submit',
    event => {
      const formData = new FormData(event.target);
      const formProps = Object.fromEntries(formData);
      const name = correctName(formProps.name);
      const course = formProps.course.trim().split('/');
      const info = formProps.info.trim().split('/');
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const phone = validatePhone(formProps.phone);
      if (formProps.orderbump && formProps.orderbumpdetail) {
        course[0] += `,${formProps.orderbumpdetail.trim()}`;
      }
      if (!phone) {
        alert('กรุณากรอกข้อมูลสำหรับติดต่อให้ถูกต้อง');
        event.preventDefault();
        return false;
      }
      localStorage.setItem('email', formProps.email);
      localStorage.setItem('phone', phone);
      localStorage.setItem('name', name);
      localStorage.setItem('price', formProps.price);
      localStorage.setItem('course', course[0]);
      localStorage.setItem('campaign', info[1]);
      localStorage.setItem('seller', info[0]);
      localStorage.setItem('deal_id', formProps.deal_id);
      localStorage.setItem('px', formProps.px);
      localStorage.setItem('redirect_url', formProps.redirect_url);
      localStorage.setItem('params', JSON.stringify(params));
    },
    false
  );
}

function validatePhone(phone) {
  if (!phone) return undefined;
  phone = phone.replace(/(\s+|-|\+66|^66|^0)/g, '0');
  if (phone.length !== 10) return undefined;
  return phone;
}
function correctName(name) {
  name = name
    .replace(/^(นาย|นางสาว|น.ส.|ด.ช.|นาง|คุณ |เด็กชาย|เด็กหญิง)/g, '')
    .replace(/\s\s+/g, ' ')
    .trim();
  return name;
}

function appendUserAgent(PXID) {
  const l = window.location;
  const px = PXID + '|' + window.navigator.userAgent + '|' + l.protocol + '//' + l.host + l.pathname;
  return px;
}
