
let getMeru = async (src, dest, browserInstance) => {
  try {
    let newTab = await browserInstance.newPage();
    await newTab.goto("https://www.taxiautofare.com/9/Delhi-Meru-Cabs-fare-calculator/loid")

    // #select2-chosen-1
    await newTab.waitForSelector
    ('#Source', { visible: true })
    await newTab.click('#Source')
    await newTab.type("#Source", src, { delay: 10 });
    await newTab.waitForSelector('#Destination', { visible: true })
    await newTab.click('#Destination')
    await newTab.type("#Destination", dest, { delay: 10 });
    await newTab.keyboard.press("Enter");
    await newTab.waitForSelector(".FaresDiv") 

    let consoleFn = () => {
      let detailsArr = [];
      let fareElements = document.querySelectorAll(".bFareValue")
      let meru_fare;
      const divs = document.querySelectorAll('.txtC');
      const targetDiv = Array.prototype.find.call(divs, div => div.textContent.trim() === 'Meru Cabs Fare');
      let parent1 = targetDiv.parentElement;
      let parent2 = parent1.parentElement;
      let child1 = parent2.querySelector('.FaresDiv')
      let child2 = child1.querySelector('.innerbox')
      let child3 = child2.querySelector('.bFareValue')
      meru_fare = child3.innerText
      let mprice=meru_fare.split("₹")[1].split(' ')[1]
      detailsArr.push({
        Type: "Sedan",
        Fare: mprice,
      });      
      return detailsArr;
    };

    return newTab.evaluate(consoleFn);
  } catch (err) {
    console.log("ERROR CAUGHT IN meru.js \n", err);
  }
};








module.exports.getMeru = getMeru;
