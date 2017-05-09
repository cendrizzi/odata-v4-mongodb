var createFilter = require('../lib').createFilter
var expect = require('chai').expect

describe("mongodb visitor", () => {
   var f;
  beforeEach(function() {
    var match;
     if (match = this.currentTest.title.match(/expression[^\:]*\:  ?(.*)/)) {
       f = createFilter(match[1]);

     }
  });

  //all numbers are referencing this:
  //http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398116

  it("expression: 1 eq 1", () => {
      expect(f).to.deep.eql({})
  })

  it("expression: (1 eq 1) or (2 eq 2)", () => {
      expect(f).to.deep.eql({})
  })

  it("expression: length(CompanyName) eq 19", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: indexof(CompanyName,'lfreds') eq 1", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: substring(CompanyName,1) eq 'lfreds Futterkiste'", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: concat(concat(City,', '), Country) eq 'Berlin, Germany'", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: trim(CompanyName) eq 'Alfreds Futterkiste'", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: toupper(CompanyName) eq 'ALFREDS FUTTERKISTE'", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: tolower(CompanyName) eq 'alfreds futterkiste'", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })



  it("expression: year(BirthDate) eq 0", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: month(BirthDate) eq 12", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: day(StartTime) eq 8", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: hour(StartTime) eq 1", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: minute(StartTime) eq 0", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: second(StartTime) eq 0", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: date(StartTime) ne date(EndTime)", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: time(StartTime) le StartOfDay", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: totaloffsetminutes(StartTime) eq 60", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: StartTime ge now()", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })
  it("expression: StartTime eq now()", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })
  it("expression: StartTime le now()", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: StartTime eq mindatetime()", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: EndTime eq maxdatetime()", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: round(Freight) eq 32", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: floor(Freight) eq 32", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: ceiling(Freight) eq 33", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })


  it("expression: Price add 5 gt 10", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: 10 add 5 lt 10", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: Price add Other", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })


  it("expression: Price mul 5 gt 10", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: 10 mul 5 lt 10", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: Price mul Other", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })

  it("expression: (A mul B) div 10", () => {
    console.log('f', JSON.stringify(f));
    // expect(f).to.deep.eql({})
  })



  it("expression 5.1.1.6.1: NullValue eq null", () => {
      expect(f).to.deep.eql({ NullValue: null })
  })

  it("expression 5.1.1.6.1: TrueValue eq true", () => {
      expect(f).to.deep.eql({ TrueValue: true })
  })

  it("expression 5.1.1.6.1: FalseValue eq false", () => {
      expect(f).to.deep.eql({ FalseValue: false })
  })

  it("expression 5.1.1.6.1: IntegerValue lt -128", () => {
      expect(f).to.deep.eql({ IntegerValue: { $lt: -128 } })
  })

  it("expression 5.1.1.6.1: DecimalValue eq 34.95", () => {
      expect(f).to.deep.eql({ DecimalValue: 34.95 })
  })

  it("expression 5.1.1.6.1: StringValue eq 'Say Hello,then go'", () => {
      expect(f).to.deep.eql({ StringValue: 'Say Hello,then go' })
  })

  it("expression 5.1.1.6.1: DurationValue eq duration'P12DT23H59M59.999999999999S'", () => {
      expect(f).to.deep.eql({ DurationValue: 1033199000 })
  })

  it("expression 5.1.1.6.1: DateValue eq 2012-12-03", () => {
      expect(f).to.deep.eql({ DateValue: '2012-12-03' })
  })

  it("expression 5.1.1.6.1: DateTimeOffsetValue eq 2012-12-03T07:16:23Z", () => {
      expect(f).to.deep.eql({ DateTimeOffsetValue: new Date('2012-12-03T07:16:23Z') })
  })

  it("expression 5.1.1.6.1: GuidValue eq 01234567-89ab-cdef-0123-456789abcdef", () => {
      expect(f).to.deep.eql({ GuidValue: '01234567-89ab-cdef-0123-456789abcdef' })
  })

  it("expression 5.1.1.6.1: Int64Value eq 0", () => {
      expect(f).to.deep.eql({ Int64Value: 0 })
  })

  it("expression 5.1.1.6.1: A eq INF", () => {
      expect(f).to.deep.eql({ A: Infinity })
  })

  it("expression 5.1.1.6.1: A eq 0.31415926535897931e1", () => {
      expect(f).to.deep.eql({ A: 0.31415926535897931e1 })
  })

  it("expression 5.1.1.1.2: A ne 1", () => {
      expect(f).to.deep.eql({ A: { $ne: 1 } })
  })

  it("expression 5.1.1.1.3: A gt 2", () => {
      expect(f).to.deep.eql({ A: { $gt: 2 } })
  })

  it("expression 5.1.1.1.4: A ge 3", () => {
      expect(f).to.deep.eql({ A: { $gte: 3 } })
  })

  it("expression 5.1.1.1.5: A lt 2", () => {
      expect(f).to.deep.eql({ A: { $lt: 2 } })
  })

  it("expression 5.1.1.1.6: A le 2", () => {
      expect(f).to.deep.eql({ A: { $lte: 2 } })
  })

  it("expression: A/b eq 1", () => {
      expect(f).to.deep.eql({ 'A.b': 1 })
  })

  it("expression 5.1.1.3: (A/b eq 2) or (B/c lt 4) and ((E gt 5) or (E lt -1))", () => {
      expect(f).to.deep.eql({ $or: [{ 'A.b': 2 }, { $and: [{ 'B.c': { $lt: 4 } }, { $or: [{ E: { $gt: 5 } }, { E: { $lt: -1 } }] }] }] })
  })

  it("expression 5.1.1.4.1: contains(A, 'BC')", () => {
      expect(f).to.deep.eql({ A: /BC/gi });
  })

  it("expression 5.1.1.4.2: endswith(A, 'CD')", () => {
      expect(f).to.deep.eql({ A: /CD$/gi });
  })

  it("expression 5.1.1.4.3: startswith(A, 'CD')", () => {
      expect(f).to.deep.eql({ A: /^CD/gi });
  })
})
