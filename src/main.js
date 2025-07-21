//===========================================================
// ================ example use init script =================
//===========================================================
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
//===========================================================
// ================ example use init script =================
//===========================================================

// ================================================================
// ================== start cookies script ======================
// ================================================================
function checkCookie(name) {
  return getCookie(name) !== null;
}

function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim());
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
// ================================================================
// =================== end cookies script =======================
// ================================================================

// ================================================================
// ================== start affiliate script ======================
// ================================================================
const AFFILIATE_CHANNEL = "affiliate";
const AFFILIATE_KEY = "aff";
let isSubmitPayment = false;

function initAffiliateScript() {
  window.localStorage.removeItem(AFFILIATE_KEY);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const aff = urlParams.get(AFFILIATE_KEY);
  if (aff) {
    window.localStorage.setItem(AFFILIATE_KEY, aff);
    document.querySelectorAll(`input[name="mkter"]`).forEach(function (element) {
      element.value = AFFILIATE_CHANNEL;
    });
  }
}

function getAffiliateIdFromLocalStorage() {
  return window.localStorage.getItem(AFFILIATE_KEY);
}

// ================================================================
// =================== end affiliate script =======================
// ================================================================

function init(arguments, callback) {
  const isPass = checkFieldsRequireFully(
    arguments.hiddenFieldConfig,
    arguments.defaultFields,
    arguments.landingPageType
  );

  if (!arguments?.isStopAffiliate) {
    initAffiliateScript();
  } else {
    window.localStorage.removeItem(AFFILIATE_KEY);
  }

  if (!isPass) return isPass;
  const userAgent = appendUserAgent(arguments.PXID);
  const dealId = genDealId();
  clearDataLocalStorage(arguments.clearDataFields);

  //==================== Start => edit channel_name ====================
  const urlParams = new URLSearchParams(window.location.search);
  const channel_name = urlParams.get("channel_name");
  const channelNameElements = document.getElementsByName("channel_name");
  if (channel_name && channelNameElements.length) {
    for (const channelNameIdElement of channelNameElements) {
      channelNameIdElement.value = channel_name;
    }
  }
  //==================== End => edit channel_name  ====================

  //==================== Start => add user cookie landing ====================
  if (checkCookie("user")) {
    const user = JSON.parse(decodeURIComponent(getCookie("user")));
    document.getElementsByName("email").forEach((element) => {
      element.value = user.email || "";
    });
    document.getElementsByName("fullname").forEach((element) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      element.value = fullName;
    });
  }
  //==================== End => add user cookie landing ====================

  //==================== Start => add deal_id into all input deal_id elements ====================
  var dealIdElements = document.getElementsByName("deal_id");
  if (dealIdElements.length) {
    for (const dealIdElement of dealIdElements) {
      dealIdElement.value = dealId;
    }
  } else {
    console.log('%cinput "deal_id" not define!', "color: red; font-size: larger");
  }
  //==================== End => add deal_id into all input deal_id elements ====================

  //==================== Start => add px into all input px elements ====================
  var pxElements = document.getElementsByName("px");
  if (pxElements.length) {
    for (const pxElement of pxElements) {
      pxElement.value = userAgent;
    }
  } else {
    console.log('%cinput "px" not define!', "color: red; font-size: larger");
  }
  //==================== End => add px into all input px elements ====================

  //==================== Start => add landing_url into all input landing_url elements ====================
  var landingUrls = document.getElementsByName("landing_url");
  if (landingUrls.length) {
    for (const landingUrl of landingUrls) {
      landingUrl.value = window.location.href;
    }
  } else {
    console.log('%cinput "landing_url" not define!', "color: red; font-size: larger");
  }
  includeJqueryAddressScript();
  console.log('%cinput "includeJqueryAddressScript" start.!', "color: yellow; font-size: larger");
  //==================== End => add landing_url into all input landing_url elements ====================
  if (callback) callback();
  return {
    userAgent,
    dealId,
  };
}

function checkFieldsRequireFully(
  hiddenFieldConfig,
  defaultFieldsWith = [],
  landingPageType = "SGC"
) {
  // ================ static fields =====================
  const different = ["search", "address", "sub_district", "district", "province", "zipcode"];
  const defaultHiddenFields = [
    "px",
    "sub_district",
    "district",
    "province",
    "zipcode",
    "deal_id",
    "landing_url",
  ];
  let defaultFields = ["email", "phone", "search", "address"];
  if (defaultFieldsWith.length) {
    defaultFields = defaultFieldsWith;
  } else {
    defaultFields = [...defaultFields, ...defaultHiddenFields];
    defaultFields = defaultFields.filter((item) => !different.includes(item));
  }

  if (landingPageType === "YR") {
    defaultFields = defaultFields.filter((item) => !different.includes(item));
  }
  for (const defaultField of defaultFields) {
    if (!document.querySelectorAll(`input[name="${defaultField}"]`).length) {
      alert(`คุณไม่ได้ใส่ Field ${defaultField}`);
      return false;
    }
  }
  // check optional fields AND splite into remainingFields
  let remainingFields;
  if (landingPageType === "YR") {
    const optionalFieldsYR = [
      "campaign_info",
      "campaign",
      "price",
      "course",
      "orderbumpdetail",
      "discountCode",
      "channel",
      "channel_name",
      "bonusdetail",
      "type",
      "landing_type",
      "redirect_url",
      "callback_url",
      "category",
      "email_cf_channel",
      "title",
      "free_sku",
      "gift_item",
      "course_upsell",
      "upsell_price",
      "upsell_detail",
    ];
    const filtered = Object.entries(hiddenFieldConfig).filter(
      ([key]) => !optionalFieldsYR.includes(key)
    );
    remainingFields = Object.fromEntries(filtered);
  } else {
    const optionalFieldsSGC = [
      "orderbumpdetail",
      "campaign",
      "campaign_info",
      "bonusdetail",
      "discountCode",
      "channel",
      "channel_name",
      "type",
      "landing_type",
      "callback_url",
      "category",
      "email_cf_channel",
      "title",
      "free_sku",
      "gift_item",
      "course_upsell",
      "upsell_price",
      "upsell_detail",
    ];
    const filtered = Object.entries(hiddenFieldConfig).filter(
      ([key]) => !optionalFieldsSGC.includes(key)
    );
    remainingFields = Object.fromEntries(filtered);
  }
  // ================ get params URL =====================
  const urlParams = new URLSearchParams(window.location.search);
  const discountCode = urlParams.get("discountCode");
  // ================ get params URL =====================
  for (const hiddenField of Object.keys(hiddenFieldConfig)) {
    if (!document.querySelectorAll(`input[name="${hiddenField}"]`).length) {
      alert(`คุณไม่ได้ใส่ Field "${hiddenField}" ใน Maketer Configuration หรือ Hidden Field`);
      return false;
    }
    if (remainingFields[hiddenField] !== undefined && !hiddenFieldConfig[hiddenField].length) {
      alert(`คุณไม่ได้ใส่ค่าใน Field "${hiddenField}" ใน Maketer Configuration`);
      return false;
    }
    if (hiddenField === "discountCode" && discountCode) {
      hiddenFieldConfig[hiddenField] = discountCode;
    }
    document.querySelectorAll(`input[name="${hiddenField}"]`).forEach(function (element) {
      element.value = hiddenFieldConfig[hiddenField];
    });
  }
  return true;
}

function blockSpam(formProps) {
  const dataSpam = {
    email:
      "charan.p|Zz656|Boss3870952199727@gmail.com|zz656633@gmail.com|gupgift22@hotmail.com|wanvisa@gmail.com|lampong251731@gmail.com|sinmue89@gmail.com|payungpong.1986@gmail.com",
    name: "ชรัญเพ็ง|ชัณเพ็ง|ชรัณ เพ็งนวม|ชรัณ|เพ็งนวม|อนุพงษ์ พุงพงษ์",
  };
  if (RegExp(dataSpam.email).test(formProps.email) || RegExp(dataSpam.name).test(formProps.name))
    return false;
  return true;
}

function genDealId() {
  var d = new Date().toISOString().substring(0, 10);
  var dd = d.split("-").join("");
  var rand = Math.round(Math.random() * 1000000);
  const deal_id = dd + rand;
  return deal_id;
}

function appendUserAgent(PXID) {
  const l = window.location;
  const customfieldLanding = {px: PXID, agent: window.navigator.userAgent, landing: l.protocol + '//' + l.host + l.pathname};
  return JSON.stringify(customfieldLanding);
}

function clearDataLocalStorage(fields) {
  fields.map((field) => {
    localStorage.setItem(field, "");
  });
}

function validatePhone(phone, feildName) {
  if (!phone) return undefined;
  phone = phone.replace(/(\s+|-|\+66|^66|^0)/g, "");
  document.querySelectorAll(`input[name="${feildName}"]`).forEach(function (element) {
    element.value = phone;
  });
  if (phone.length !== 9) return undefined;
  return phone;
}

async function validateEmailWithZeroBounce(email) {
  if (!email) return false;
  const api_key = "85b5a9d5f22746b4906a30a7a33fe7ff";
  const response = await fetch(
    `https://api.zerobounce.net/v2/validate?api_key=${api_key}&email=${email}`
  );
  const responseData = await response.json();
  if (responseData && responseData.status) {
    switch (responseData.status) {
      case "valid":
        return true;
      case "catch":
        return true;
      case "do_not_mail":
        if (
          responseData.sub_status === "role_based" ||
          responseData.sub_status === "role_based_catch_all"
        )
          return true;
        else return false;

      default:
        return false;
    }
  }
  return false;
}

let isEmailValid = true;

async function handleEmailInput(event) {
  const email = event.target.value;
  const regex = /^([a-zA-Z0-9]+)(([\w.+-]|)+)([a-zA-Z0-9])@\w+([.-]?\w+)([.]\w{2,3})+$/;
  if (!email) {
    isEmailValid = false;
    return;
  }
  if (regex.test(email)) {
    isEmailValid = await validateEmailWithZeroBounce(email);
    console.log("🚀 ~ handleEmailInput ~ isEmailValid:", isEmailValid);
    return;
  }
  isEmailValid = false;
  return;
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("validate email!!");
  const emailInputs = document.querySelectorAll('input[name="email"]');
  for (let index = 0; index < emailInputs.length; index++) {
    const emailInput = emailInputs[index];
    emailInput.addEventListener("blur", async (event) => {
      await handleEmailInput(event);
    });
  }
});

function validateEmail(email, feildName) {
  if (!email) return undefined;
  const regex = /^([a-zA-Z0-9]+)(([\w.+-]|)+)([a-zA-Z0-9])@\w+([.-]?\w+)([.]\w{2,3})+$/;

  if (!regex.test(email) || !isEmailValid) {
    return undefined;
  }

  document.querySelectorAll(`input[name="${feildName}"]`).forEach(function (element) {
    element.value = email;
  });
  return email;
}

function correctName(name) {
  name = name
    .replace(/^(นาย|นางสาว|น.ส.|ด.ช.|ด.ญ.|นาง|คุณ|เด็กชาย|เด็กหญิง)/g, "")
    .replace(/\s\s+/g, " ")
    .trim();
  return name;
}

//==========================================================================================================================

function listenerForm(feildNames) {
  //=========== set default package into package select option ============
  const defaultPackage = document.querySelector('input[name="defaultPackage"]');
  if (defaultPackage) {
    const _defaultPackage = defaultPackage.value.split("/");

    document.querySelectorAll('select[name="package"]').forEach(function (element) {
      element.value = defaultPackage.value;
    });
    document.querySelectorAll('input[name="discountCode"]').forEach(function (element) {
      element.value = _defaultPackage[2] || "";
    });
    document.querySelectorAll('input[name="course"]').forEach(function (element) {
      element.value = _defaultPackage[0];
    });
    document.querySelectorAll('input[name="price"]').forEach(function (element) {
      element.value = _defaultPackage[1];
    });

    //=========== set default package into package select option ============

    document.body.addEventListener("change", function (event) {
      //========= package select option on change into other package select option =============
      if (event.target.name === "package") {
        document.querySelectorAll('select[name="package"]').forEach(function (element) {
          element.value = event.target.value;
        });
        const _package = event.target.value.split("/");
        document.querySelector('input[name="discountCode"]').value = _package[2] || "";
        document.querySelector('input[name="course"]').value = _package[0];
        document.querySelector('input[name="price"]').value = _package[1];
      }
      //========= package select option on change into other package select option =============
    });
  }

  document.addEventListener(
    "submit",
    (event) => {
      const formData = new FormData(event.target);
      const formProps = Object.fromEntries(formData);
      const block = blockSpam(formProps);
      if (!block) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        alert("blocked user spam");
        return block;
      }

      delete formProps.defaultPackage;
      delete formProps.package;

      // ===================== Start = > set localStorage =====================
      for (const feildName of feildNames) {
        if (feildName === "fullname") {
          const name = correctName(formProps[feildName]);
          localStorage.setItem(feildName, name);
        } else if (feildName === "email") {
          const email = validateEmail(formProps[feildName], feildName);
          if (!email) {
            alert("กรุณากรอกอีเมล์ให้ถูกต้อง");
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            clearDataLocalStorage(feildNames);
            return false;
          }
          localStorage.setItem(feildName, email);
        } else if (feildName === "phone") {
          const phone = validatePhone(formProps[feildName], feildName);
          if (!phone) {
            alert("กรุณากรอกข้อมูลสำหรับติดต่อให้ถูกต้อง");
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            clearDataLocalStorage(feildNames);
            return false;
          }
          localStorage.setItem(feildName, `0${phone}`);
        } else if (feildName === "course") {
          if (
            formProps.orderbump &&
            formProps.orderbumpdetail &&
            !feildNames.includes("orderbump", "orderbumpdetail")
          ) {
            formProps[feildName] += `,${formProps.orderbumpdetail.trim()}`;
          }
          localStorage.setItem(feildName, formProps[feildName]);
        } else if (feildName === "params") {
          const urlSearchParams = new URLSearchParams(window.location.search);
          const params = Object.fromEntries(urlSearchParams.entries());
          localStorage.setItem(feildName, JSON.stringify(params));
        } else {
          localStorage.setItem(feildName, formProps[feildName] || "");
        }
      }
      // ===================== End = > set localStorage =====================

      // =============== Add required fields for LINE landing ===============
      localStorage.setItem("landing_url", formProps["landing_url"] || "");
    },
    true
  );
}

// use in wordpress
async function createPaymentWith(formData) {
  const { ip } = await getIp();
  const affId = getAffiliateIdFromLocalStorage();
  const pxMixed = appendUserAgent(formData["fb_pixel"]);
  const paymentSuccessRedirectUrl = new URL(formData["redirect_url"]);
  const redirectQuery = {
    dealId: formData["deal_id"] || "",
    email: formData["email"] || "",
    fullName: formData["fullname"] || "",
    phone: formData["phone"] || "",
    price: formData["price"] || "",
    discountCode: formData["discountCode"] || "",
  };
  Object.keys(redirectQuery).forEach((key) =>
    paymentSuccessRedirectUrl.searchParams.set(key, redirectQuery[key])
  );

  const courses = formData["course"] ? formData["course"].split(",") : [];

  if (formData["orderbump"] && formData["orderbumpdetail"].length) {
    const orderbumpdetail = formData["orderbumpdetail"]
      ? formData["orderbumpdetail"].split(",")
      : [];
    courses.push(...orderbumpdetail);
  }

  const payload = {
    userId: undefined,
    redeem: true,
    type: formData["type"],
  };

  if (courses.length) {
    const cartItems = courses.map((product) => {
      return {
        product: product,
        quantity: 1,
      };
    });
    var data = {
      cartItems,
      userdata: {
        email: formData["email"],
        tel: formData["phone"] || "",
        fullName: formData["fullname"] || "",
      },
      cartTracking: {
        convertionId: formData["conversion"] || "",
        campaign: formData["campaign"] || "",
        seller: affId ? AFFILIATE_CHANNEL : formData["mkter"] || "",
        channel: affId ? AFFILIATE_CHANNEL : "SGC",
        ...(affId ? { affiliateId: affId } : {}),
        ip: ip,
        utm_source: formData.utm_source || "",
        utm_medium: formData.utm_medium || "",
        utm_campaign: formData.utm_campaign || "",
        utm_term: formData.utm_term || "",
        utm_content: formData.utm_content || "",
        customField1: formData["deal_id"],
        customField2: pxMixed,
        customField3: formData["initial_sku"] || undefined,
      },
      paymentSuccessRedirectUrl: paymentSuccessRedirectUrl.toString(),
    };

    if (formData["type"] && formData["type"]?.length) data.userdata.payload = payload;

    if (formData["callback_url"]) data.paymentSuccessCallbackUrl = formData["callback_url"];

    let { url } = await createCart(data);
    if (formData["discountCode"]) url = `${url}?discountCode=${formData["discountCode"]}`;

    return url;
  }
}

const checkIsLineLanding = () => {
  return hiddenFieldConfig?.email_cf_channel === "line";
};

async function submitPayment(localStorageItems) {
  isSubmitPayment = true;
  const { ip } = await getIp();
  const dataFromLocalStorage = getDataFromLocalStorage(localStorageItems);
  const affId = getAffiliateIdFromLocalStorage();
  const redirectQuery = new URLSearchParams({
    dealId: dataFromLocalStorage["deal_id"],
    email: dataFromLocalStorage["email"],
    fullName: dataFromLocalStorage["fullname"],
    phone: dataFromLocalStorage["phone"],
    price: dataFromLocalStorage["price"],
    discountCode: dataFromLocalStorage["discountCode"],
  }).toString();

  const courses = dataFromLocalStorage["course"] ? dataFromLocalStorage["course"].split(",") : [];

  if (dataFromLocalStorage["orderbump"] === "on") {
    const orderbumpCourse = dataFromLocalStorage["orderbumpdetail"].split(",");
    if (!courses.includes(...orderbumpCourse)) {
      courses.push(...orderbumpCourse);
    }
  }

  const payload = {
    userId: undefined,
    redeem: true,
    type: dataFromLocalStorage["type"],
  };

  if (courses.length) {
    const cartItems = courses.map((product) => {
      return {
        product: product,
        quantity: 1,
      };
    });

    dataFromLocalStorage[
      "initial_sku"
    ] = `${dataFromLocalStorage["course"]}|${dataFromLocalStorage["email"]}`;

    var data = {
      cartItems,
      userdata: {
        email: dataFromLocalStorage["email"],
        tel: dataFromLocalStorage["phone"] || "",
        fullName: dataFromLocalStorage["fullname"] || "",
      },
      cartTracking: {
        convertionId: conversion?.hash || "",
        campaign: dataFromLocalStorage["campaign"] || "",
        seller: affId ? AFFILIATE_CHANNEL : dataFromLocalStorage["mkter"] || "",
        channel: affId ? AFFILIATE_CHANNEL : "SGC",
        ...(affId ? { affiliateId: affId } : {}),
        ip: ip,
        utm_source: dataFromLocalStorage["params"]?.utm_source || "",
        utm_medium: dataFromLocalStorage["params"]?.utm_medium || "",
        utm_campaign: dataFromLocalStorage["params"]?.utm_campaign || "",
        utm_term: dataFromLocalStorage["params"]?.utm_term || "",
        utm_content: dataFromLocalStorage["params"]?.utm_content || "",
        customField1: dataFromLocalStorage["deal_id"],
        customField2: dataFromLocalStorage["px"],
        customField3: dataFromLocalStorage["initial_sku"] || undefined,
      },
      paymentSuccessRedirectUrl: `${dataFromLocalStorage["redirect_url"]}?${redirectQuery}`,
    };

    if (dataFromLocalStorage["type"] && dataFromLocalStorage["type"]?.length)
      data.userdata.payload = payload;

    if (dataFromLocalStorage["callback_url"])
      data.paymentSuccessCallbackUrl = dataFromLocalStorage["callback_url"];

    let { url, cartNo } = await createCart(data);
    if (dataFromLocalStorage["discountCode"])
      url = `${url}?discountCode=${dataFromLocalStorage["discountCode"]}`;

    if (checkIsLineLanding()) {
      const dataFromLocalStorage = getDataFromLocalStorage(localStorageItems);
      const cartParams = {
        cartNo,
        deal_id: dataFromLocalStorage["deal_id"],
        email: dataFromLocalStorage["email"],
        fullname: dataFromLocalStorage["fullname"],
        phone: dataFromLocalStorage["phone"],
        course: dataFromLocalStorage["course"],
        price: dataFromLocalStorage["price"],
        title: dataFromLocalStorage["campaign"],
        orderbump: dataFromLocalStorage["orderbump"],
        orderbumpdetail: dataFromLocalStorage["orderbumpdetail"],
        bonusdetail: dataFromLocalStorage["bonusdetail"],
        ...(dataFromLocalStorage["orderbump"] === "on"
          ? {}
          : { discountCode: dataFromLocalStorage["discountCode"] }),
      };

      const sendEmailLine =
        "https://futureskill.app.n8n.cloud/webhook/uat/line/email";
      await fetchPost(
        sendEmailLine,
        {
          ...cartParams,
          dealId: cartParams.deal_id,
          name: cartParams.fullname,
          landingUrl: dataFromLocalStorage["landing_url"],
        },
        {
          "content-type": "application/json",
        }
      );

      const redirectQuery = new URLSearchParams(cartParams).toString();

      const urlLiff = `https://liff.line.me/2001020437-59oRp6nY?${redirectQuery}`;

      setTimeout(function () {
        window.location.replace(urlLiff);
      }, 1500);
    } else {
      setTimeout(function () {
        window.location.replace(url);
      }, 1500);
    }
  }
}

function getDataFromLocalStorage(localStorageItems) {
  const dataFromLocalStorage = {};
  for (const localStorageItem of localStorageItems) {
    if (localStorageItem === "params") {
      dataFromLocalStorage[localStorageItem] = JSON.parse(
        localStorage.getItem(localStorageItem) || "{}"
      );
    } else {
      dataFromLocalStorage[localStorageItem] = localStorage.getItem(localStorageItem);
    }
  }
  return dataFromLocalStorage;
}
async function createCart(cart) {
  var data = await fetchPost(
    "https://uat.futureskill.live/pay-api/cart/create",
    cart,
    {
      "Content-Type": "application/json",
      Authorization:
        "Basic MjUwNjY2MDU4NTY5MDQ1ODg6cE5DV3E0YnRxU09Bb05zM1VEaHM=",
    }
  );
  return data;
}

async function getIp() {
  const response = await fetch("https://cloudflare.com/cdn-cgi/trace");
  let data = await response.text();
  data = data
    .trim()
    .split("\n")
    .reduce(function (obj, pair) {
      pair = pair.split("=");
      return (obj[pair[0]] = pair[1]), obj;
    }, {});
  return data;
}

async function fetchPost(url, data, headers) {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

// ================================================================
// ===================== add jquery script ========================
// ================================================================

function includeJqueryAddressScript() {
  const scriptJQL = document.createElement("script");
  scriptJQL.src =
    "https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dependencies/JQL.min.js";

  // make code in script to be treated as JavaScript module
  // script.type = 'module';
  scriptJQL.type = "text/javascript";

  scriptJQL.onload = () => {
    console.log("Script earthchie JQL loaded successfuly");
  };

  scriptJQL.onerror = () => {
    console.log("Error occurred while loading script earthchie JQL");
  };

  document.body.appendChild(scriptJQL);

  const scriptTypeahead = document.createElement("script");
  scriptTypeahead.src =
    "https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dependencies/typeahead.bundle.js";

  // make code in script to be treated as JavaScript module
  // script.type = 'module';
  scriptTypeahead.type = "text/javascript";

  scriptTypeahead.onload = () => {
    console.log("Script earthchie typeahead loaded successfuly");
  };

  scriptTypeahead.onerror = () => {
    console.log("Error occurred while loading script earthchie typeahead ");
  };

  document.body.appendChild(scriptTypeahead).onload = () => {
    // script one
    ($.Thailand = function (o) {
      "use strict";
      o = $.extend({}, $.Thailand.defaults, o);
      function n(e) {
        var r,
          t = [],
          a = [],
          c = [];
        return (
          e.lookup &&
            e.words &&
            ((t = e.lookup.split("|")), (a = e.words.split("|")), (e = e.data)),
          (r = function (e) {
            return (
              "number" == typeof e && (e = t[e]),
              e.replace(/[A-Z]/gi, function (e) {
                var t = e.charCodeAt(0);
                return a[t < 97 ? t - 65 : 26 + t - 97];
              })
            );
          }),
          e.map(function (i) {
            var o = 1;
            3 === i.length && (o = 2),
              i[o].map(function (n) {
                n[o].map(function (a) {
                  (a[o] = a[o] instanceof Array ? a[o] : [a[o]]),
                    a[o].map(function (e) {
                      var t = {
                        district: r(a[0]),
                        amphoe: r(n[0]),
                        province: r(i[0]),
                        zipcode: e,
                      };
                      2 === o &&
                        ((t.district_code = a[1] || !1),
                        (t.amphoe_code = n[1] || !1),
                        (t.province_code = i[1] || !1)),
                        c.push(t);
                    });
                });
              });
          }),
          c
        );
      }
      var l = function (e, t, a) {
        for (
          var n, i, o, r = 0, c = 0, s = 0, p = (e += "").length, d = (t += "").length, h = 0;
          h < p;
          h += 1
        )
          for (n = 0; n < d; n += 1) {
            for (i = 0; h + i < p && n + i < d && e.charAt(h + i) === t.charAt(n + i); ) i += 1;
            s < i && ((s = i), (r = h), (c = n));
          }
        return (
          (o = s) &&
            (r && c && (o += l(e.substr(0, c), t.substr(0, c), !1)),
            r + s < p &&
              c + s < d &&
              (o += l(e.substr(r + s, p - r - s), t.substr(c + s, d - c - s), !1))),
          !1 === a
            ? o
            : e === t
            ? 100
            : d < p
            ? Math.floor((o / p) * 100)
            : Math.floor((o / d) * 100)
        );
      };
      !(function (a) {
        var e,
          t = o.database_type.toLowerCase();
        switch (("json" !== t && "zip" !== t && (t = o.database.split(".").pop()), t)) {
          case "json":
            $.getJSON(o.database, function (e) {
              a(new JQL(n(e)));
            }).fail(function (e) {
              throw new Error('File "' + o.database + '" is not exists.');
            });
            break;
          case "zip":
            o.zip_worker_path ||
              $("script").each(function () {
                var e = this.src.split("/");
                "zip.js" === e.pop() && (zip.workerScriptsPath = e.join("/") + "/");
              }),
              ((e = new XMLHttpRequest()).responseType = "blob"),
              (e.onreadystatechange = function () {
                if (4 === e.readyState) {
                  if (200 !== e.status) throw new Error('File "' + o.database + '" is not exists.');
                  zip.createReader(new zip.BlobReader(e.response), function (e) {
                    e.getEntries(function (e) {
                      e[0].getData(new zip.BlobWriter(), function (e) {
                        var t = new FileReader();
                        (t.onload = function () {
                          a(new JQL(n(JSON.parse(t.result))));
                        }),
                          t.readAsText(e);
                      });
                    });
                  });
                }
              }),
              e.open("GET", o.database),
              e.send();
            break;
          default:
            throw new Error(
              'Unknown database type: "' +
                o.database_type +
                '". Please define database_type explicitly (json or zip)'
            );
        }
      })(function (i) {
        $.Thailand.DB = i;
        var a,
          n,
          e = {
            empty: " ",
            suggestion: function (e) {
              return e && e.district
                ? (e.zipcode && (e.zipcode = " » " + e.zipcode),
                  "<div>" +
                    e.district +
                    " » " +
                    e.amphoe +
                    " » " +
                    e.province +
                    e.zipcode +
                    "</div>")
                : '<div class="one-px"></div>';
            },
          };
        for (a in o)
          -1 < a.indexOf("$") &&
            "$search" !== a &&
            o.hasOwnProperty(a) &&
            o[a] &&
            o[a]
              .typeahead(
                { hint: !0, highlight: !0, minLength: 1 },
                {
                  limit: o.autocomplete_size,
                  templates: e,
                  source: function (e, t) {
                    var a = [],
                      n = this.$el.data("field");
                    try {
                      a = i
                        .select("*")
                        .where(n)
                        .match("^" + e)
                        .orderBy(n)
                        .fetch();
                    } catch (e) {}
                    t(a);
                  },
                  display: function (e) {
                    return e[this.$el.data("field")];
                  },
                }
              )
              .parent()
              .find(".tt-dataset")
              .data("field", a.replace("$", ""));
        for (a in (o.$search &&
          o.$search.typeahead(
            { hint: !0, highlight: !0, minLength: 2 },
            {
              limit: o.autocomplete_size,
              templates: e,
              source: function (t, e) {
                var a = [];
                try {
                  a = new JQL(
                    a
                      .concat(i.select("*").where("zipcode").match(t).fetch())
                      .concat(i.select("*").where("province").match(t).fetch())
                      .concat(i.select("*").where("amphoe").match(t).fetch())
                      .concat(i.select("*").where("district").match(t).fetch())
                      .map(function (e) {
                        return JSON.stringify(e);
                      })
                      .filter(function (e, t, a) {
                        return a.indexOf(e) == t;
                      })
                      .map(function (e) {
                        return (
                          ((e = JSON.parse(e)).likely = [
                            5 * l(t, e.district),
                            3 * l(t, e.amphoe.replace(/^เมือง/, "")),
                            l(t, e.province),
                            l(t, e.zipcode),
                          ].reduce(function (e, t) {
                            return Math.max(e, t);
                          })),
                          e
                        );
                      })
                  )
                    .select("*")
                    .orderBy("likely desc")
                    .fetch();
                } catch (t) {}
                e(a);
              },
              display: function (e) {
                return "";
              },
            }
          ),
        o))
          -1 < a.indexOf("$") &&
            o.hasOwnProperty(a) &&
            o[a] &&
            o[a]
              .bind("typeahead:select typeahead:autocomplete", function (e, t) {
                for (a in o)
                  (n = a.replace("$", "")),
                    -1 < a.indexOf("$") &&
                      o.hasOwnProperty(a) &&
                      o[a] &&
                      t[n] &&
                      o[a].typeahead("val", t[n]).trigger("change");
                "function" == typeof o.onDataFill && (delete t.likely, o.onDataFill(t));
              })
              .blur(function () {
                this.value || $(this).parent().find(".tt-dataset").html("");
              });
        "function" == typeof o.onLoad && o.onLoad(),
          "function" == typeof o.onComplete && o.onComplete();
      });
    }),
      ($.Thailand.defaults = {
        database:
          "https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/database/db.json",
        database_type: "auto",
        zip_worker_path: !1,
        autocomplete_size: 20,
        onLoad: function () {},
        onDataFill: function () {},
        $district: !1,
        $district_code: !1,
        $amphoe: !1,
        $amphoe_code: !1,
        $province: !1,
        $province_code: !1,
        $zipcode: !1,
        $search: !1,
      }),
      ($.Thailand.setup = function (e) {
        $.extend($.Thailand.defaults, e);
      });

    // script two
    $.Thailand.setup({
      database:
        "https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/database/db.json",
    });
    $.Thailand({
      $search: $(".widget-form input[name='search']"),
      onDataFill: function (data) {
        var show =
          data.district + " » " + data.amphoe + " » " + data.province + " » " + data.zipcode;
        $(".widget-form input[name='sub_district']").val(data.district);
        $(".widget-form input[name='district']").val(data.amphoe);
        $(".widget-form input[name='province']").val(data.province);
        $(".widget-form input[name='zipcode']").val(data.zipcode);
        showAddressValue($, show);
      },
      onLoad: function () {
        var emp = $(".one-px");
        if (emp) emp.remove();
      },
      templates: {
        empty: " ",
        suggestion: function (data) {
          if (data.zipcode) {
            data.zipcode = " » " + data.zipcode;
          }
          return (
            '<div class="tt-highlight">' +
            data.district +
            " » " +
            data.amphoe +
            " » " +
            data.province +
            " » " +
            data.zipcode +
            "</div>"
          );
        },
      },
    });
    $(".widget-form input[name='search']").change(function () {
      var emp = $(".one-px");
      if (emp) emp.remove();
    });
    function showAddressValue($, data) {
      $(".widget-form input[name='search']").blur();
      $(".widget-form input[name='search']").val(data);
    }
  };
}

// ========= START ADD EVENT LISTENER ON PUSH DATA LAYER =========

window.dataLayer = new Proxy(window.dataLayer || [], {
  set: (obj, prop, value) => {
    if (prop !== "length") {
      const pushEvent = new CustomEvent("datalayerpush", {
        detail: value,
      });
      window.dispatchEvent(pushEvent);
    }

    return Reflect.set(obj, prop, value);
  },
});

window.addEventListener("datalayerpush", async (event) => {
  if (
    event.detail?.event === "FSCompleteRegistration" &&
    getAffiliateIdFromLocalStorage() &&
    isSubmitPayment === false
  ) {
    const localStorageItems = [
      "email",
      "phone",
      "fullname",
      "price",
      "course",
      "seller",
      "campaign",
      "deal_id",
      "px",
      "redirect_url",
      "callback_url",
      "discountCode",
      "params",
      "type",
      "landing_url",
    ];
    await submitPayment(localStorageItems);
  }
});
// ========= END ADD EVENT LISTENER ON PUSH DATA LAYER =========
