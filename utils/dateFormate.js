module.exports = {
  dateFormate : (integralDate) => {
    let dateReg1 = /\d{4}\/\d+\/\d+/; // 匹配YYYY/MM/DD类型的
    let dateReg2 = /\d{4}\-\d+\-\d+/; // 匹配YYYY-MM-DD类型的
    let year = '';
    let month = '';
    let date = '';
    if (dateReg1.test(integralDate)) {
      year = integralDate.split('/')[0];
      month = integralDate.split('/')[1].length < 2 ? '0' + integralDate.split('/')[1] : integralDate.split('/')[1];
      date = integralDate.split('/')[2].length < 2 ? '0' + integralDate.split('/')[2] : integralDate.split('/')[2];
    } else if (dateReg2.test(integralDate)) {
      year = integralDate.split('-')[0];
      month = integralDate.split('-')[1].length < 2 ? '0' + integralDate.split('-')[1] : integralDate.split('-')[1];
      date = integralDate.split('-')[2].length < 2 ? '0' + integralDate.split('-')[2] : integralDate.split('-')[2];
    } else {
      console.log('不符合预备年份格式')
    }

    return {
      year,
      month,
      date,
      formateSlash: year + '/' + month + '/' + date,
      formateStrip: year + '-' + month + '-' + date
    }
  }
}