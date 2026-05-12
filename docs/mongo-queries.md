<div dir="rtl">

# MongoDB Queries – TrickyTray

מסמך זה מתאר את השאילתות וה־Aggregation שבוצעו ב־MongoDB Compass כחלק מדרישות הפרויקט.

## שם בסיס הנתונים

TrickyTrayMongo

## Collections שנוצרו

- buyers
- donors
- gifts
- orders

---

## שאילתה 1 – מתנות שמחירן גדול מ־100

Collection: gifts

</div>

```javascript
{ price: { $gt: 100 } }
```

<div dir="rtl">

---

## שאילתה 2 – מתנות בקטגוריית Kitchen

Collection: gifts

</div>

```javascript
{ category: "Kitchen" }
```

<div dir="rtl">

---

## שאילתה 3 – הזמנות מאושרות

Collection: orders

</div>

```javascript
{ status: "Confirmed" }
```

<div dir="rtl">

---

## שאילתה 4 – קונה לפי כתובת מייל

Collection: buyers

</div>

```javascript
{ email: "sara@example.com" }
```

<div dir="rtl">

---

## שאילתה 5 – הזמנות מתאריך 1.5.2026 ואילך

Collection: orders

</div>

```javascript
{ orderDate: { $gte: ISODate("2026-05-01") } }
```

<div dir="rtl">

---

## Aggregation – סך ההכנסות לפי מתנה

Collection: orders

</div>

```javascript
[
  { $unwind: "$gifts" },
  {
    $group: {
      _id: "$gifts.giftName",
      totalRevenue: { $sum: "$gifts.price" },
      purchasesCount: { $sum: 1 }
    }
  },
  { $sort: { totalRevenue: -1 } }
]
```

<div dir="rtl">

---

## הסבר קצר על ה־Aggregation

ה־Aggregation מבצע שלושה שלבים:

1. `$unwind` – מפרק את מערך המתנות gifts כך שכל מתנה הופכת למסמך נפרד.
2. `$group` – מקבץ לפי שם המתנה ומחשב:
   - totalRevenue – סכום כל המחירים של אותה מתנה.
   - purchasesCount – מספר הפעמים שהמתנה הופיעה בהזמנות.
3. `$sort` – ממיין את התוצאות לפי סך ההכנסות מהגבוה לנמוך.

---

## צילומי מסך

צילומי המסך של השאילתות וה־Aggregation נשמרו בתיקייה:

docs/screenshots/

שמות הקבצים:

- query1.png
- query2.png
- query3.png
- query4.png
- query5.png
- aggregation.png

</div>