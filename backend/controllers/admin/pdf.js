const fs = require("fs");
const path = require("path");
const PdfPrinter = require("pdfmake");

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../../fonts", "static", "Roboto-Regular.ttf"),
    bold: path.join(__dirname, "../../fonts", "static", "Roboto-Bold.ttf"),
    italics: path.join(__dirname, "../../fonts", "static", "Roboto-Italic.ttf"),
    bolditalics: path.join(
      __dirname,
      "../../fonts",
      "static",
      "Roboto-BoldItalic.ttf"
    ),
  },
};
const printer = new PdfPrinter(fonts);

const logoPath = path.join(__dirname, "../../assets", "logo.png");
const logoBase64 = fs.readFileSync(logoPath).toString("base64");
const logoDataUri = `data:image/png;base64,${logoBase64}`;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB");
}

function generatePdf(data, res) {
  const {
    revenue,
    timeframe,
    regular_orders = [],
    group_order_items = [],
    invoice_recipient,
    invoice_email,
    timestamp,
  } = data;

  const [monthNum, year] = timeframe.split("-");
  const monthName = new Date(year, monthNum - 1).toLocaleString("en-GB", {
    month: "long",
  });

  const summaryTable = {
    table: {
      body: Object.entries({
        Timeframe: timeframe,
        "Total Orders": data.orderCount,
        "Regular Orders Revenue": revenue.regular_orders.toFixed(2) + " €",
        "Group Orders Revenue": revenue.group_orders.toFixed(2) + " €",
        "Delivery Fees": revenue.delivery_fees.toFixed(2) + " €",
        "Total Revenue": revenue.total.toFixed(2) + " €",
      }).map(([label, val]) => [label, { text: val, alignment: "right" }]),
    },
    margin: [0, 0, 0, 20],
  };

  const regularOrderTable = {
    table: {
      headerRows: 1,
      widths: ["20%", "15%", "10%", "*"],
      body: [
        [
          { text: "Order ID", style: "small" },
          { text: "Created At", style: "small" },
          { text: "Total", style: "small" },
          { text: "Products", style: "small" },
        ],
        ...regular_orders.map((order) => [
          { text: order.order_id, style: "smallFont" },
          formatDate(order.created_at),
          {
            text: `${order.total_price.toFixed(2)} €`,
            alignment: "right",
          },
          {
            stack: (order.products || []).map((p) => ({
              text: `${p.name} x${p.quantity} = ${parseFloat(
                p.total_revenue
              ).toFixed(2)} €`,
              margin: [0, 2, 0, 0],
            })),
          },
        ]),
      ],
    },
    layout: "lightHorizontalLines",
    margin: [0, 0, 0, 20],
  };

  const groupOrderTable = {
    table: {
      headerRows: 1,
      widths: ["18%", "18%", "14%", "6%", "10%", "10%", "*"],
      body: [
        [
          { text: "Participant ID", style: "small" },
          { text: "Group Order ID", style: "small" },
          { text: "Joined At", style: "small" },
          { text: "Qty", style: "small" },
          { text: "Unit", style: "small" },
          { text: "Revenue", style: "small" },
          { text: "Product + Type", style: "small" },
        ],
        ...group_order_items.map((item) => [
          { text: item.participant_id, style: "smallFont" },
          { text: item.group_order_id, style: "smallFont" },
          formatDate(item.joined_at),
          item.quantity,
          `${item.unit_price.toFixed(2)} €`,
          `${item.total_revenue.toFixed(2)} €`,
          `${item.product_name} (${item.pickup_or_delivery})`,
        ]),
      ],
    },
    layout: "lightHorizontalLines",
  };

  const docDefinition = {
    content: [
      {
        columns: [
          {
            image: logoDataUri,
            width: 200,
          },
          {
            width: "*",
            alignment: "right",
            stack: [
              { text: "Localloop", bold: true, fontSize: 12 },
              { text: "Titova cesta 23" },
              { text: "2000, Maribor" },
              { text: "Phone: +386 65 485 894" },
              { text: "Email: info@localloop.com" },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      {
        columns: [
          {
            width: "50%",
            stack: [
              {
                text: "Invoice",
                fontSize: 24,
                bold: true,
                margin: [0, 0, 0, 15],
              },
              {
                text: `Date of Issue: ${formatDate(timestamp)}`,
                margin: [0, 0, 0, 3],
              },
              {
                text: `Invoice For: ${monthName} ${year}`,
                margin: [0, 0, 0, 3],
              },
              { text: "Currency: EUR", margin: [0, 0, 0, 15] },
              { text: "To:", bold: true, margin: [0, 0, 0, 3] },
              { text: invoice_recipient },
              { text: invoice_email },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "", margin: [0, 0, 0, 35] },
              {
                text: "Created by: Georgi Dimov",
                alignment: "right",
                italics: true,
                margin: [0, 0, 0, 5],
              },
              {
                text: "Reason:",
                bold: true,
                alignment: "right",
                margin: [0, 50, 0, 3],
              },
              { text: "Monthly revenue for provider", alignment: "right" },
            ],
          },
        ],
        margin: [0, 0, 0, 30],
      },

      { text: "Revenue Report", style: "header" },
      summaryTable,
      { text: "Regular Orders", style: "subheader" },
      regular_orders.length
        ? regularOrderTable
        : { text: "No regular orders.", italics: true },
      { text: "Group Orders", style: "subheader" },
      group_order_items.length
        ? groupOrderTable
        : { text: "No group orders.", italics: true },

      {
        text: `\n\nTotal Amount Due (after 15% service fee): ${(
          revenue.total * 0.85
        ).toFixed(2)} €`,
        style: "totalAmount",
        margin: [0, 20, 0, 5],
      },
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: `Date: ${formatDate(timestamp)}`, margin: [0, 0, 0, 0] },
              { text: "Location: Maribor, Slovenia", margin: [0, 5, 0, 0] },
            ],
            margin: [0, 40, 0, 0], // push left side content down
          },
          {
            width: "50%",
            stack: [
              {
                text: "Note: A 15% service fee has been applied to the total revenue for our company.",
                italics: true,
                fontSize: 9,
                color: "gray",
                alignment: "right",
                margin: [0, 0, 0, 35],
              },
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 150,
                    y2: 0,
                    lineWidth: 0.5,
                    lineColor: "#333",
                  },
                ],
                alignment: "right",
                margin: [0, 0, 0, 2],
              },
              {
                text: "CEO: Georgi Dimov",
                alignment: "right",
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
        columnGap: 30,
      },
    ],

    styles: {
      footerNote: {
        fontSize: 8,
        italics: true,
        color: "#666666",
      },

      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      smallFont: {
        fontSize: 7,
        color: "#555555",
      },
      small: {
        fontSize: 9,
        bold: true,
        color: "#333333",
      },
      totalAmount: {
        fontSize: 14,
        bold: true,
        alignment: "right",
      },
    },
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
    },

    footer: {
      columns: [
        {
          text: "This invoice serves as an official statement of earnings for the specified period. Please retain it for your records. For any questions, contact billing@localloop.com.",
          style: "footerNote",
          alignment: "center",
        },
      ],
      margin: [40, 0, 40, 20],
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="revenue-report.pdf"');
  pdfDoc.pipe(res);
  pdfDoc.end();
}

module.exports = { generatePdf };
