// ================ example use init script =================
// (function () {
//   const arguments = {
//     clearDataFields: [
//       'email',
//       'phone',
//       'name',
//       'price',
//       'course',
//       'campaign',
//       'seller',
//       'px',
//       'redirect_url',
//       'callback_url',
//       'params',
//       'discountCode',
//     ],PXID
//   };
//   const {userAgent, dealId} = init(arguments);
//   document.querySelector('input[name="px"]').value = userAgent;
//   document.querySelector('input[name="deal_id"]').value = dealId
// })();
// ================ example use init =================
function init(arguments, callback) {
  const userAgent = appendUserAgent(arguments.PXID);
  console.log('userAgent', userAgent);
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
  console.log('window', window);
  const l = window.location;
  console.log('window.navigator.userAgent', window.navigator.userAgent);
  const px = PXID + '|' + window.navigator.userAgent + '|' + l.protocol + '//' + l.host + l.pathname;
  console.log('px', px);
  return px;
}
