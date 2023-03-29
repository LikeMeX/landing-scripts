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
// })()
// ================ example use init =================

function init(arguments, callback) {
  const userAgent = appendUserAgent(arguments.PXID);
  const dealId = genDealId();
  clearDataLocalStorage(arguments.clearDataFields);
  var dealIdElements = document.getElementsByName('deal_id');
  var pxElements = document.getElementsByName('px');
  if (dealIdElements.length) {
    for (const dealIdElement of dealIdElements) {
      dealIdElement.value = dealId;
    }
  } else {
    console.log('%cinput "deal_id" not define!', 'color: red; font-size: larger');
  }
  if (pxElements.length) {
    for (const pxElement of pxElements) {
      pxElement.value = userAgent;
    }
  } else {
    console.log('%cinput "px" not define!', 'color: red; font-size: larger');
  }
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

function appendUserAgent(PXID) {
  const l = window.location;
  const px = PXID + '|' + window.navigator.userAgent + '|' + l.protocol + '//' + l.host + l.pathname;
  return px;
}

function clearDataLocalStorage(fields) {
  fields.map(field => {
    localStorage.setItem(field, '');
  });
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

//=======================================================================

// async function submitPayment() {
//   console.log('submitPayment');
//   const {ip} = await getIp();

//   var {
//     email,
//     tel,
//     fullName,
//     course,
//     seller,
//     campaign,
//     query,
//     dealId,
//     px,
//     redirect_url,
//     discountCode,
//     callback_url,
//     price,
//   } = getDataFromLocalStorage();

//   const redirectQuery = new URLSearchParams({
//     dealId,
//     email,
//     fullName,
//     phone: tel,
//     price,
//     discountCode,
//   }).toString();

//   var courses = course ? course.split(',') : [];
//   if (courses.length) {
//     var cartItems = courses.map(c => {
//       return {
//         product: c,
//         quantity: 1,
//       };
//     });
//     var data = {
//       cartItems,
//       userdata: {
//         email: email,
//         tel: tel || '',
//         fullName: fullName || '',
//       },
//       cartTracking: {
//         convertionId: conversion?.hash || '',
//         campaign: campaign || '',
//         seller: seller || '',
//         channel: 'SGC',
//         ip,
//         utm_source: query.utm_source || '',
//         utm_medium: query.utm_medium || '',
//         utm_campaign: query.utm_campaign || '',
//         utm_term: query.utm_term || '',
//         utm_content: query.utm_content || '',
//         customField1: dealId,
//         customField2: px,
//       },
//       paymentSuccessRedirectUrl: `${redirect_url}?${redirectQuery}`,
//     };

//     if (callback_url) data.paymentSuccessCallbackUrl = callback_url;

//     var url = await createCart(data);

//     if (discountCode) url = `${url}?discountCode=${discountCode}`;
//     setTimeout(function () {
//       window.location.replace(url);
//     }, 1500);
//   }
// }

// function getDataFromLocalStorage() {
//   var email = localStorage.getItem('email');
//   var tel = localStorage.getItem('phone');
//   var fullName = localStorage.getItem('name');
//   var price = localStorage.getItem('price');
//   var course = localStorage.getItem('course');
//   var seller = localStorage.getItem('seller');
//   var campaign = localStorage.getItem('campaign');
//   var dealId = localStorage.getItem('deal_id');
//   var px = localStorage.getItem('px');
//   var redirect_url = localStorage.getItem('redirect_url');
//   var callback_url = localStorage.getItem('callback_url');
//   var discountCode = localStorage.getItem('discountCode');
//   var query = JSON.parse(localStorage.getItem('params') || {});
//   return {
//     email,
//     tel,
//     fullName,
//     course,
//     seller,
//     campaign,
//     dealId,
//     query,
//     px,
//     redirect_url,
//     price,
//     discountCode,
//     callback_url,
//   };
// }

// async function createCart(cart) {
//   var data = await fetchPost('https://pay-api.futureskill.co/api/cart/create', cart, {
//     'Content-Type': 'application/json',
//     Authorization: 'Basic NzAyMTg2NzcwNzY0ODMzMDQ6ejE5ZmpmckZrMGZuUVFRTUc0UHQ=',
//   });
//   return data.url;
// }

// async function getIp() {
//   const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
//   let data = await response.text();
//   data = data
//     .trim()
//     .split('\n')
//     .reduce(function (obj, pair) {
//       pair = pair.split('=');
//       return (obj[pair[0]] = pair[1]), obj;
//     }, {});
//   return data;
// }

// async function fetchPost(url, data, headers) {
//   const response = await fetch(url, {
//     method: 'POST',
//     headers,
//     body: JSON.stringify(data),
//   });
//   return response.json();
// }
