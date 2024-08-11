/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import { orderPaymentMethod, OrderResponse } from 'common/types/order';
import { currencyFormatter } from 'common/utils/formatter';
import moment from 'moment';
import nodemailer from 'nodemailer';

const htmlSendMail = (
    title?: string,
    mainContent?: string,
    secondContent?: string,
    label?: string,
    link?: string
) => {
    if (link) {
        return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Send Mail</title>
      <style media="all" type="text/css">
      /* -------------------------------------
      GLOBAL RESETS
  ------------------------------------- */
      
      body {
        font-family: Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 16px;
        line-height: 1.3;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%;
      }
      
      table td {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        vertical-align: top;
      }
      /* -------------------------------------
      BODY & CONTAINER
  ------------------------------------- */
      
      body {
        background-color: #f4f5f6;
        margin: 0;
        padding: 0;
      }
      
      .body {
        background-color: #f4f5f6;
        width: 100%;
      }
      
      .container {
        margin: 0 auto !important;
        max-width: 600px;
        padding: 0;
        padding-top: 24px;
        width: 600px;
      }
      
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 600px;
        padding: 0;
      }
      /* -------------------------------------
      HEADER, FOOTER, MAIN
  ------------------------------------- */
      
      .main {
        background: #ffffff;
        border: 1px solid #eaebed;
        border-radius: 16px;
        width: 100%;
      }
      
      .wrapper {
        box-sizing: border-box;
        padding: 24px;
      }
      
      .footer {
        clear: both;
        padding-top: 24px;
        text-align: center;
        width: 100%;
      }
      
      .footer td,
      .footer p,
      .footer span,
      .footer a {
        color: #9a9ea6;
        font-size: 16px;
        text-align: center;
      }
      /* -------------------------------------
      TYPOGRAPHY
  ------------------------------------- */
      
      p {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 16px;
      }
      
      a {
        color: #0867ec;
        text-decoration: underline;
      }
      /* -------------------------------------
      BUTTONS
  ------------------------------------- */
      
      .btn {
        box-sizing: border-box;
        min-width: 100% !important;
        width: 100%;
      }
      
      .btn > tbody > tr > td {
        padding-bottom: 16px;
      }
      
      .btn table {
        width: auto;
      }
      
      .btn table td {
        background-color: #ffffff;
        border-radius: 4px;
        text-align: center;
      }
      
      .btn a {
        background-color: #ffffff;
        border: solid 2px #0867ec;
        border-radius: 4px;
        box-sizing: border-box;
        color: #0867ec;
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 12px 24px;
        text-decoration: none;
        text-transform: capitalize;
      }
      
      .btn-primary table td {
        background-color: #0867ec;
      }
      
      .btn-primary a {
        background-color: #0867ec;
        border-color: #0867ec;
        color: #ffffff;
      }
      
      @media all {
        .btn-primary table td:hover {
          background-color: #ec0867 !important;
        }
        .btn-primary a:hover {
          background-color: #ec0867 !important;
          border-color: #ec0867 !important;
        }
      }
      
      /* -------------------------------------
      OTHER STYLES THAT MIGHT BE USEFUL
  ------------------------------------- */
      
      .last {
        margin-bottom: 0;
      }
      
      .first {
        margin-top: 0;
      }
      
      .align-center {
        text-align: center;
      }
      
      .align-right {
        text-align: right;
      }
      
      .align-left {
        text-align: left;
      }
      
      .text-link {
        color: #0867ec !important;
        text-decoration: underline !important;
      }
      
      .clear {
        clear: both;
      }
      
      .mt0 {
        margin-top: 0;
      }
      
      .mb0 {
        margin-bottom: 0;
      }
      
      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0;
      }
      
      .powered-by a {
        text-decoration: none;
      }
      
      /* -------------------------------------
      RESPONSIVE AND MOBILE FRIENDLY STYLES
  ------------------------------------- */
      
      @media only screen and (max-width: 640px) {
        .main p,
        .main td,
        .main span {
          font-size: 16px !important;
        }
        .wrapper {
          padding: 8px !important;
        }
        .content {
          padding: 0 !important;
        }
        .container {
          padding: 0 !important;
          padding-top: 8px !important;
          width: 100% !important;
        }
        .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        .btn table {
          max-width: 100% !important;
          width: 100% !important;
        }
        .btn a {
          font-size: 16px !important;
          max-width: 100% !important;
          width: 100% !important;
        }
      }
      /* -------------------------------------
      PRESERVE THESE STYLES IN THE HEAD
  ------------------------------------- */
      
      @media all {
        .ExternalClass {
          width: 100%;
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
      }
      </style>
    </head>
    <body>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
          <td>&nbsp;</td>
          <td class="container">
            <div class="content">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader">This is a email form Perfume Shop. Thank you!</span>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
  
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper">
                    <p>${title}</p>
                    <p>${mainContent}</p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary button-link">
                      <tbody>
                        <tr>
                          <td align="left">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td><a href="${link}" target="_blank">${label}</a></td>
                              </tr>
                             </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p>${secondContent}</p>
                  </td>
                </tr>
  
                <!-- END MAIN CONTENT AREA -->
                </table>
  
              <!-- START FOOTER -->
              <div class="footer">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-block">
                      <span class="apple-link">Perfume shop</span>
                    </td>
                  </tr>
                </table>
              </div>
  
              <!-- END FOOTER -->
              
  <!-- END CENTERED WHITE CONTAINER --></div>
          </td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>`;
    }
    return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Send Mail</title>
      <style media="all" type="text/css">
      /* -------------------------------------
      GLOBAL RESETS
  ------------------------------------- */
      
      body {
        font-family: Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 16px;
        line-height: 1.3;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%;
      }
      
      table td {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        vertical-align: top;
      }
      /* -------------------------------------
      BODY & CONTAINER
  ------------------------------------- */
      
      body {
        background-color: #f4f5f6;
        margin: 0;
        padding: 0;
      }
      
      .body {
        background-color: #f4f5f6;
        width: 100%;
      }
      
      .container {
        margin: 0 auto !important;
        max-width: 600px;
        padding: 0;
        padding-top: 24px;
        width: 600px;
      }
      
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 600px;
        padding: 0;
      }
      /* -------------------------------------
      HEADER, FOOTER, MAIN
  ------------------------------------- */
      
      .main {
        background: #ffffff;
        border: 1px solid #eaebed;
        border-radius: 16px;
        width: 100%;
      }
      
      .wrapper {
        box-sizing: border-box;
        padding: 24px;
      }
      
      .footer {
        clear: both;
        padding-top: 24px;
        text-align: center;
        width: 100%;
      }
      
      .footer td,
      .footer p,
      .footer span,
      .footer a {
        color: #9a9ea6;
        font-size: 16px;
        text-align: center;
      }
      /* -------------------------------------
      TYPOGRAPHY
  ------------------------------------- */
      
      p {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 16px;
      }
      
      a {
        color: #0867ec;
        text-decoration: underline;
      }
      /* -------------------------------------
      BUTTONS
  ------------------------------------- */
      
      .btn {
        box-sizing: border-box;
        min-width: 100% !important;
        width: 100%;
      }
      
      .btn > tbody > tr > td {
        padding-bottom: 16px;
      }
      
      .btn table {
        width: auto;
      }
      
      .btn table td {
        background-color: #ffffff;
        border-radius: 4px;
        text-align: center;
      }
      
      .btn a {
        background-color: #ffffff;
        border: solid 2px #0867ec;
        border-radius: 4px;
        box-sizing: border-box;
        color: #0867ec;
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 12px 24px;
        text-decoration: none;
        text-transform: capitalize;
      }
      
      .btn-primary table td {
        background-color: #0867ec;
      }
      
      .btn-primary a {
        background-color: #0867ec;
        border-color: #0867ec;
        color: #ffffff;
      }
      
      @media all {
        .btn-primary table td:hover {
          background-color: #ec0867 !important;
        }
        .btn-primary a:hover {
          background-color: #ec0867 !important;
          border-color: #ec0867 !important;
        }
      }
      
      /* -------------------------------------
      OTHER STYLES THAT MIGHT BE USEFUL
  ------------------------------------- */
      
      .last {
        margin-bottom: 0;
      }
      
      .first {
        margin-top: 0;
      }
      
      .align-center {
        text-align: center;
      }
      
      .align-right {
        text-align: right;
      }
      
      .align-left {
        text-align: left;
      }
      
      .text-link {
        color: #0867ec !important;
        text-decoration: underline !important;
      }
      
      .clear {
        clear: both;
      }
      
      .mt0 {
        margin-top: 0;
      }
      
      .mb0 {
        margin-bottom: 0;
      }
      
      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0;
      }
      
      .powered-by a {
        text-decoration: none;
      }
      
      /* -------------------------------------
      RESPONSIVE AND MOBILE FRIENDLY STYLES
  ------------------------------------- */
      
      @media only screen and (max-width: 640px) {
        .main p,
        .main td,
        .main span {
          font-size: 16px !important;
        }
        .wrapper {
          padding: 8px !important;
        }
        .content {
          padding: 0 !important;
        }
        .container {
          padding: 0 !important;
          padding-top: 8px !important;
          width: 100% !important;
        }
        .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        .btn table {
          max-width: 100% !important;
          width: 100% !important;
        }
        .btn a {
          font-size: 16px !important;
          max-width: 100% !important;
          width: 100% !important;
        }
      }
      /* -------------------------------------
      PRESERVE THESE STYLES IN THE HEAD
  ------------------------------------- */
      
      @media all {
        .ExternalClass {
          width: 100%;
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
      }
      </style>
    </head>
    <body>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
          <td>&nbsp;</td>
          <td class="container">
            <div class="content">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader">This is a email form Perfume Shop. Thank you!</span>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
  
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper">
                    <p>${title}</p>
                    <p>${mainContent}</p>
                    <p>${secondContent}</p>
                  </td>
                </tr>
  
                <!-- END MAIN CONTENT AREA -->
                </table>
  
              <!-- START FOOTER -->
              <div class="footer">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-block">
                      <span class="apple-link">Perfume shop</span>
                    </td>
                  </tr>
                </table>
              </div>
  
              <!-- END FOOTER -->
              
  <!-- END CENTERED WHITE CONTAINER --></div>
          </td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>`;
};

const htmlBill = (order: OrderResponse) => {
    const totalOriginalPrice = order?.orderDetail.reduce((acc, cur) => {
        return acc + cur.originalPrice * cur.quantity;
    }, 0);
    const totalDiscount = totalOriginalPrice - order.totalAmount;
    const createAt = moment(order?.createdAt).format('YYYY-MMM-DD');
    return `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Email Receipt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
      @media screen {
        @font-face {
          font-family: "Source Sans Pro";
          font-style: normal;
          font-weight: 400;
          src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"),
            url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff)
              format("woff");
        }

        @font-face {
          font-family: "Source Sans Pro";
          font-style: normal;
          font-weight: 700;
          src: local("Source Sans Pro Bold"), local("SourceSansPro-Bold"),
            url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff)
              format("woff");
        }
      }
      body,
      table,
      td,
      a {
        -ms-text-size-adjust: 100%; /* 1 */
        -webkit-text-size-adjust: 100%; /* 2 */
      }
      table,
      td {
        mso-table-rspace: 0pt;
        mso-table-lspace: 0pt;
      }

      img {
        -ms-interpolation-mode: bicubic;
      }
      a[x-apple-data-detectors] {
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        color: inherit !important;
        text-decoration: none !important;
      }
      div[style*="margin: 16px 0;"] {
        margin: 0 !important;
      }

      body {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      table {
        border-collapse: collapse !important;
      }

      a {
        color: #1a82e2;
      }

      img {
        height: auto;
        line-height: 100%;
        text-decoration: none;
        border: 0;
        outline: none;
      }

	  .btn {
        box-sizing: border-box;
        min-width: 100% !important;
        width: 100%;
      }
      
      .btn > tbody > tr > td {
        padding-bottom: 16px;
      }
      
      .btn table {
        width: auto;
      }
      
      .btn table td {
        background-color: #ffffff;
        border-radius: 4px;
        text-align: center;
      }
      
      .btn a {
        background-color: #ffffff;
        border: solid 2px #0867ec;
        border-radius: 4px;
        box-sizing: border-box;
        color: #0867ec;
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 12px 24px;
        text-decoration: none;
        text-transform: capitalize;
      }
      
      .btn-primary table td {
        background-color: #0867ec;
      }
      
      .btn-primary a {
        background-color: #0867ec;
        border-color: #0867ec;
        color: #ffffff;
      }
      
      @media all {
        .btn-primary table td:hover {
          background-color: #ec0867 !important;
        }
        .btn-primary a:hover {
          background-color: #ec0867 !important;
          border-color: #ec0867 !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #eaeaea">
    <!-- start preheader -->
    <div
      class="preheader"
      style="
        display: none;
        max-width: 0;
        max-height: 0;
        overflow: hidden;
        font-size: 1px;
        line-height: 1px;
        color: #fff;
        opacity: 0;
      "
    >
      The Perfume đã nhận đơn hàng ${order?.id}
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" bgcolor="#eaeaea">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px"
          >
            <tr>
              <td align="center" valign="top" style="padding: 36px 24px"></td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td align="center" bgcolor="#eaeaea">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px"
          >
            <tr>
              <td
                align="left"
                bgcolor="#ffffff"
                style="
                  padding: 36px 24px 0;
                  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                  border-top: 3px solid #d4dadf;
                "
              >
                <h1
                  style="
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: -1px;
                    line-height: 48px;
                  "
                >
				Cảm ơn bạn đã đặt hàng tại The Perfume!
                </h1>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" bgcolor="#eaeaea">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px"
          >
            <tr>
              <td
                align="left"
                bgcolor="#ffffff"
                style="
                  padding: 12px 24px 0 24px;
                  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                  font-size: 16px;
                  line-height: 24px;
                "
              >
                <p style="margin: 0">
					Đây là bản tóm tắt về đơn đặt hàng gần đây của bạn. Nếu bạn có bất kỳ câu hỏi hoặc mối quan tâm về đơn đặt hàng của bạn, xin vui lòng
                  <a href="http://localhost:3000/contact">liên hệ với chúng tôi</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td
                align="left"
                bgcolor="#ffffff"
                style="
                  padding: 12px 24px 24px 24px;
                  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                  font-size: 16px;
                  line-height: 24px;
                "
              >
					<p>${createAt}</p>
					<p>Mã đơn hàng: ${order?.id}</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td
                      align="left"
                      bgcolor="#eaeaea"
                      width="75%"
                      style="
                        padding: 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                      "
                    >
                      <strong>Sản phẩm</strong>
                    </td>
                    <td
                      align="left"
                      bgcolor="#eaeaea"
                      width="25%"
                      style="
                        padding: 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                      "
                    >
                      <strong>Thành tiền</strong>
                    </td>
                  </tr>
                  ${order?.orderDetail?.map(
                      (detail) =>
                          `
                    <tr>
                    <td
                      align="left"
                      width="75%"
                      style="
                        padding: 6px 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                      "
                    >
                      ${detail?.productName} <br />
                      Phân loại hàng: ${detail?.category}, ${detail?.size}ml<br />
                      x${detail?.quantity}
                    </td>
                    <td
                      align="left"
                      width="25%"
                      style="
                        padding: 6px 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                      "
                    >
                       <p style="margin: 0 0 5px 0;">
                          ${
                              detail?.discountPrice
                                  ? `<span style="text-decoration: line-through;">${currencyFormatter(detail?.originalPrice)}</span>`
                                  : currencyFormatter(detail.originalPrice)
                          }
                      </p>
                      ${
                          detail?.discountPrice
                              ? `<p style="margin: 0 0 5px 0;">${currencyFormatter(detail?.discountPrice)}</p>`
                              : ''
                      }
                    </td>
                  </tr>`
                  )}

                  <tr>
                    <td
                      align="left"
                      width="75%"
                      style="
                        padding: 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                        border-top: 2px dashed #eaeaea;
                        border-bottom: 2px dashed #eaeaea;
                      "
                    >
                      <strong>Giảm giá</strong>
                    </td>
                    <td
                      align="left"
                      width="25%"
                      style="
                        padding: 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                        border-top: 2px dashed #eaeaea;
                        border-bottom: 2px dashed #eaeaea;
                      "
                    >
                      <strong>${currencyFormatter(totalDiscount)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td
                      align="left"
                      width="75%"
                      style="
                        padding: 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                        border-top: 2px dashed #eaeaea;
                        border-bottom: 2px dashed #eaeaea;
                      "
                    >
                      <strong>Tổng cộng</strong>
                    </td>
                    <td
                      align="left"
                      width="25%"
                      style="
                        padding: 12px;
                        font-family: 'Source Sans Pro', Helvetica, Arial,
                          sans-serif;
                        font-size: 16px;
                        line-height: 24px;
                        border-top: 2px dashed #eaeaea;
                        border-bottom: 2px dashed #eaeaea;
                      "
                    >
                      <strong>${currencyFormatter(order?.totalAmount)}</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" bgcolor="#eaeaea" valign="top" width="100%">
          <table
            align="center"
            bgcolor="#ffffff"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px"
          >
            <tr>
              <td
                align="left"
                valign="top"
                style="font-size: 0"
              >
                <div
                  style="
                    display: inline-block;
                    width: 100%;
                    vertical-align: top;
                  "
                >
                  <table
                    align="left"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                  >
                    <tr>
                      <td
                        align="left"
                        valign="top"
                        style="
                          padding-left: 36px;
                          font-family: 'Source Sans Pro', Helvetica, Arial,
                            sans-serif;
                          font-size: 16px;
                          line-height: 24px;
                          width: 100%;
                        "
                      >
                        <p><strong>Thông tin nhận hàng</strong></p>
                        <p>
                          Người nhận: ${order?.name}<br />Số điện thoại: ${order?.phone}<br />Địa chỉ: ${order?.address} <br />Phương thức thanh toán: ${orderPaymentMethod[order?.paymentMethod as keyof typeof orderPaymentMethod]}
                        </p>
                      </td>
                    </tr>
                  </table>
				  
                </div>
              </td>
            </tr>
            <tr>
              <td
                align="left"
                bgcolor="#ffffff"
                style="
                  padding: 12px 24px 0 24px;
                  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                  font-size: 16px;
                  line-height: 24px;
                "
              >
                <p style="margin: 0">
					Để tiến hành thanh toán bạn hãy ấn vào "Chi tiết đơn hàng" và thực hiện thanh toán theo hướng dẫn nhé.
                </p>
              </td>
            </tr>
            <tr></tr>
			<td align="center" bgcolor="#eaeaea" valign="top" width="100%">
			  <table
				align="center"
				bgcolor="#ffffff"
				border="0"
				cellpadding="0"
				cellspacing="0"
				width="100%"
				style="max-width: 240px; bgcolor="#eaeaea" "
				role="presentation"
				class="btn btn-primary button-link"
			  >
			  <tbody>
				<tr>
				  <td align="center">
					  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td><a href="http://localhost:3000/cart-completion?orderId=${order?.id}" target="_blank">Chi tiết đơn hàng</a></td>
                </tr>
					    </tbody>
					  </table>
				  </td>
				</tr>
			  </tbody>
			  </table>
			</td>
          </table>
        </td>
      </tr>
      <tr>
		<tr>
			
		  </tr>
		  <tr>
        <td align="center" bgcolor="#eaeaea" style="padding: 24px">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px"
          >
            <tr>
              <td
                align="center"
                bgcolor="#eaeaea"
                style="
                  padding: 12px 24px;
                  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                  font-size: 14px;
                  line-height: 20px;
                  color: #666;
                "
              >
                <p style="margin: 0">
					Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt đơn hàng cho tài khoản của bạn. Nếu bạn không yêu cầu đặt đơn hàng bạn có thể xóa email này một cách an toàn.
                </p>
              </td>
            </tr>
            <tr>
              <td
                align="center"
                bgcolor="#eaeaea"
                style="
                  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                  font-size: 14px;
                  line-height: 20px;
                  color: #666;
                "
              >
                <p style="margin: 0">
					The Perfume
                </p>
              </td>
            </tr>
          </table>
        </td>
        </tr>
        </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

// send mail
export const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    tls: {
        ciphers: 'SSLv3',
    },
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendMail = async ({
    to,
    subject,
    title,
    mainContent,
    secondContent,
    label,
    link,
}: {
    to: string;
    subject: string;
    title?: string;
    mainContent?: string;
    secondContent?: string;
    label?: string;
    link?: string;
}) => {
    const html = htmlSendMail(title, mainContent, secondContent, label, link);
    const options = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(options);
        // eslint-disable-next-line no-console
        console.log('Email sent:', info);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error sending email to', to, error);
        throw new Error('Error sending email');
    }
};

export const sendBill = async (order: OrderResponse) => {
    const bill = htmlBill(order);
    const options = {
        from: process.env.EMAIL_FROM,
        to: order.email,
        subject: 'Xác nhận đơn đặt hàng',
        html: bill,
    };

    try {
        const info = await transporter.sendMail(options);
        // eslint-disable-next-line no-console
        console.log('Email sent:', info);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error sending email to', order.email, error);
        throw new Error('Error sending email');
    }
};

// export const sendMail = async ({
//     to,
//     subject,
//     title,
//     mainContent,
//     secondContent,
//     label,
//     link,
// }: {
//     to: string;
//     subject: string;
//     title?: string;
//     mainContent?: string;
//     secondContent?: string;
//     label?: string;
//     link?: string;
// }) => {};

// export const sendBill = async (order: OrderResponse) => {};
