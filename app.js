const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const path = require('path');

var bodyParser = require('body-parser');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.get('/', function (req, res, next) {
  res.render('index', {
    title: 'home'
  });
});


app.post('/api', function (req, res) {
  let url = req.body.url || 'https://www.quora.com/profile/Gaurav-577';
  console.log(url);
  const email = "konidapuv@0mixmail.info"
  const password = "qwerty123"
  
  puppeteer.launch({headless: false}).then(async browser => {
    const page = await browser.newPage();

     //To block Images
    await page.setRequestInterception(true);
    page.on('request', request => {
          if (request.resourceType() === 'image')
            request.abort();
          else
            request.continue();
        });


    //Authentication
    await page.goto("https://www.quora.com");

     const credentialArraySel = 'input.text.header_login_text_box.ignore_interaction';
     const submitButtonSel = "input.submit_button.ignore_interaction";
        
     let credentialArray = await page.evaluate((sel) => {
      let arr =  document.querySelectorAll(sel);
      return [arr[0].id, arr[1].id];

      }, credentialArraySel);

      
      await page.click('#'+ credentialArray[0]);
      await page.keyboard.type(email , {delay: 200});
      await page.click('#'+ credentialArray[1]);
      await page.keyboard.type(password);
      await page.click('body');
      await page.click(submitButtonSel);
      await page.click(submitButtonSel);
      await page.waitForNavigation();
           
    //Authentication Complete



     //Scraping
  await page.goto(url + '/followers');
  //await page.screenshot({ path: 'github.png' });
      console.log('reached followers page')
    

  let cardArrSel = ".IdentityPagedListItem.UserPagedListItem.ObjectCard.PagedListItem"

    
  let data = await page.evaluate((sel) => {
          let cardArr =  document.querySelectorAll(sel);
          let nameSel = '.ObjectCard-header span span a';
          let urlSel =  '.ObjectCard-header span span a';

          let dataArr = [];
          var i= 1;
            cardArr.forEach(element => {
              dataArr.push(
                {
                  name: element.querySelector(nameSel).innerText,              
                  url: element.querySelector(urlSel).href,
                  id: i
                })
                i++;
            });

              return dataArr;
    }, cardArrSel);


    res.render('result',{data: data} )
    

    //console.log(intext);
    await browser.close();
  });




})




// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function () {
  console.log('Server started on port ' + app.get('port'));
});