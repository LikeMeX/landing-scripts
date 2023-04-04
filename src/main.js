// ================ example use init script =================
// (function () {
//   const arguments = {
//     PXID,
//     clearDataFields: ['email','phone','fullname','price','course','campaign','mkter','px','redirect_url','callback_url','params','discountCode']
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
  var landingUrls = document.getElementsByName('landing_url');
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
  if (landingUrls.length) {
    for (const landingUrl of landingUrls) {
      landingUrl.value = window.location.href;
    }
  } else {
    console.log('%cinput "landing_url" not define!', 'color: red; font-size: larger');
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
    .replace(/^(นาย|นางสาว|น.ส.|ด.ช.|ด.ญ.|นาง|คุณ|เด็กชาย|เด็กหญิง)/g, '')
    .replace(/\s\s+/g, ' ')
    .trim();
  return name;
}

function listenerForm(feildNames) {
  //=========== set default package into package select option ============
  const defaultPackage = document.querySelector('input[name="defaultPackage"]');
  document.querySelectorAll('select[name="package"]').forEach(function (element) {
    element.value = defaultPackage.value;
  });
  console.log('defaultPackage', defaultPackage);
  const _defaultPackage = defaultPackage.split('/');
  document.querySelector('input[name="discountCode"]').value = _defaultPackage[2] || '';
  document.querySelector('input[name="course"]').value = _defaultPackage[0];
  document.querySelector('input[name="price"]').value = _defaultPackage[1];
  //=========== set default package into package select option ============

  document.body.addEventListener('change', function (event) {
    //========= package select option on change into other package select option =============
    if (event.target.name === 'package') {
      document.querySelectorAll('select[name="package"]').forEach(function (element) {
        element.value = event.target.value;
      });
      const _package = event.target.value.split('/');
      document.querySelector('input[name="discountCode"]').value = _package[2] || '';
      document.querySelector('input[name="course"]').value = _package[0];
      document.querySelector('input[name="price"]').value = _package[1];
    }
    //========= package select option on change into other package select option =============
  });

  document.body.addEventListener('submit', event => {
    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);
    delete formProps.defaultPackage;
    delete formProps.package;
    for (const feildName of feildNames) {
      if (feildName === 'fullname') {
        const name = correctName(formProps[feildName]);
        localStorage.setItem(feildName, name);
      } else if (feildName === 'phone') {
        const phone = validatePhone(formProps[feildName]);
        if (!phone) {
          alert('กรุณากรอกข้อมูลสำหรับติดต่อให้ถูกต้อง');
          event.preventDefault();
          clearDataLocalStorage(feildNames);
          break;
        }
        localStorage.setItem(feildName, phone);
      } else if (feildName === 'course') {
        if (formProps.orderbump && formProps.orderbumpdetail) {
          formProps[feildName] += `,${formProps.orderbumpdetail.trim()}`;
        }
        localStorage.setItem(feildName, formProps[feildName]);
      } else if (feildName === 'params') {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        localStorage.setItem(feildName, JSON.stringify(params));
      } else {
        localStorage.setItem(feildName, formProps[feildName] || '');
      }
    }
  });
}

//=======================================================================

async function submitPayment(localStorageItems) {
  const {ip} = await getIp();
  const dataFromLocalStorage = getDataFromLocalStorage(localStorageItems);
  const redirectQuery = new URLSearchParams({
    dealId: dataFromLocalStorage['dealId'],
    email: dataFromLocalStorage['email'],
    fullName: dataFromLocalStorage['fullName'],
    phone: dataFromLocalStorage['tel'],
    price: dataFromLocalStorage['price'],
    discountCode: dataFromLocalStorage['discountCode'],
  }).toString();

  const courses = dataFromLocalStorage['course'] ? dataFromLocalStorage['course'].split(',') : [];
  const payload = {userId: undefined, redeem: true, type: dataFromLocalStorage['type']};

  if (courses.length) {
    const cartItems = courses.map(product => {
      return {
        product: product,
        quantity: 1,
      };
    });
    var data = {
      cartItems,
      userdata: {
        email: dataFromLocalStorage['email'],
        tel: dataFromLocalStorage['tel'] || '',
        fullName: dataFromLocalStorage['fullName'] || '',
        payload: payload,
      },
      cartTracking: {
        convertionId: conversion?.hash || '',
        campaign: dataFromLocalStorage['campaign'] || '',
        seller: dataFromLocalStorage['mkter'] || '',
        channel: 'SGC',
        ip: ip,
        utm_source: dataFromLocalStorage['query']?.utm_source || '',
        utm_medium: dataFromLocalStorage['query']?.utm_medium || '',
        utm_campaign: dataFromLocalStorage['query']?.utm_campaign || '',
        utm_term: dataFromLocalStorage['query']?.utm_term || '',
        utm_content: dataFromLocalStorage['query']?.utm_content || '',
        customField1: dataFromLocalStorage['dealId'],
        customField2: dataFromLocalStorage['px'],
      },
      paymentSuccessRedirectUrl: `${dataFromLocalStorage['redirect_url']}?${redirectQuery}`,
    };

    if (dataFromLocalStorage['callback_url']) data.paymentSuccessCallbackUrl = dataFromLocalStorage['callback_url'];

    var url = await createCart(data);
    if (dataFromLocalStorage['discountCode']) url = `${url}?discountCode=${dataFromLocalStorage['discountCode']}`;

    setTimeout(function () {
      window.location.replace(url);
    }, 1500);
  }
}

function getDataFromLocalStorage(localStorageItems) {
  const dataFromLocalStorage = {};
  for (const localStorageItem of localStorageItems) {
    if (localStorageItem === 'params') {
      dataFromLocalStorage[localStorageItem] = JSON.parse(localStorage.getItem(localStorageItem) || {});
    } else {
      dataFromLocalStorage[localStorageItem] = localStorage.getItem(localStorageItem);
    }
  }
  return dataFromLocalStorage;
}

async function createCart(cart) {
  var data = await fetchPost('https://pay-api.futureskill.co/api/cart/create', cart, {
    'Content-Type': 'application/json',
    Authorization: 'Basic NzAyMTg2NzcwNzY0ODMzMDQ6ejE5ZmpmckZrMGZuUVFRTUc0UHQ=',
  });
  return data.url;
}

async function getIp() {
  const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  let data = await response.text();
  data = data
    .trim()
    .split('\n')
    .reduce(function (obj, pair) {
      pair = pair.split('=');
      return (obj[pair[0]] = pair[1]), obj;
    }, {});
  return data;
}

async function fetchPost(url, data, headers) {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}
