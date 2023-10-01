const metagen = require('eleventy-plugin-metagen');
const Image = require("@11ty/eleventy-img");
const Path = require('path');
const { DateTime } = require("luxon");
const assert = require('assert')
const inspect = require("util").inspect;


const embedInstagram = require("eleventy-plugin-embed-instagram");
const schema = require("@quasibit/eleventy-plugin-schema");



async function imageLightgalleryShortcode(src, alt, sizes="100vw"){
    if(alt === undefined) {
      // You bet we throw an error on missing alt (alt="" works okay)
      throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }
    let metadata = await Image(src, {
      widths: [200, 600, 1200, 2000],
      formats: ['jpeg'],
      outputDir: "./_site/img/"
    });

    let lowsrc = metadata.jpeg[0];

    return `<a 
        href="#"
        data-srcset="${metadata.jpeg.map(entry => entry.srcset).join(", ")}"
        data-sizes="${sizes}"
        data-src="${lowsrc.url}">
        <img 
        class="carousel-cell-image"
        data-flickity-lazyload-srcset="${metadata.jpeg.map(entry => entry.srcset).join(", ")}"
        sizes="${sizes}"
        data-flickity-lazyload-src="${lowsrc.url}">
        </a>`
}


async function fotoramaImage(path, input){
    let metadata = await Image(path, {
      widths: [200, 600, 1200, 2000],
      formats: ['jpeg'],
      outputDir: "./_site/img/"
    });

    let largest = metadata.jpeg.length - 1;
    let secondLargest = Math.max(0,metadata.jpeg.length -2);

    return JSON.stringify({
        img: metadata.jpeg[secondLargest].url,
        full: metadata.jpeg[largest].url


      });
}

async function imagePoster(src, sizes = "100vw"){
   try {
    let metadata = await Image(src, {
      widths: [1920],
      formats: ['jpeg'],
      outputDir: "./_site/img/",
      sharpJpegOptions: {
        quality: 20
      }
    });
    return metadata.jpeg[0].url;
  } catch (e){
    console.error(e);
    return ""
  }
}



async function imageShortcode(src, baseURL, page, alt, sizes = "100vw") {
  if(alt === undefined) {
    // You bet we throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
  }
  if (src == undefined) {
    throw new Error(`Missing \`src\` on responsiveimage.`);
  }

  let relPath = `/img/${page}`
  let dir = `./_site/${relPath}`;
    
  let metadata = await Image(src, {
    widths: [600, 1200, 1920, 3000],
    formats: ['jpeg'],
    outputDir: dir,
    urlPath: relPath,
    filenameFormat: function (id, src, width, format, options) {
      const extension = Path.extname(src);
      const name = Path.basename(src, extension);
  
      return `${encodeURIComponent(name)}-${width}w.${format}`;
    }
    
  });
  let lowsrc = metadata.jpeg[0];
  
  let url = new URL(relPath, baseURL);
  let base = `//${url.host}/`
  let html = `<img 
        alt="${alt}"
        srcset="${metadata.jpeg.map(entry => base + entry.srcset).join(", ")}"
        sizes="${sizes}"
        src="${base}${lowsrc.url}"
        property="contentUrl"
        loading="lazy">`
  return html;
        
/*
  return `<picture>
    ${Object.values(metadata).map(imageFormat => {
      return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
    }).join("\n")}
      <img
        src="${lowsrc.url}"
        width="${lowsrc.width}"
        height="${lowsrc.height}"
        alt="${alt}"
        loading="lazy"
        decoding="async">
    </picture>`;*/

    /*
    return `<img 
        class="carousel-cell-image"
        alt="${alt}"
        data-flickity-lazyload-srcset="${metadata.jpeg.map(entry => entry.srcset).join(", ")}"
        sizes="${sizes}"
        data-flickity-lazyload-src="${lowsrc.url}">`*/
}


function workInfo(dict, workid, arg){
    
      if (dict && workid in dict && arg in dict[workid]){
        //if (dict && dict.has(workid) && arg in dict.get(workid)){
          return dict[workid][arg];
      } else {
        return undefined;
      }

}

function valueArray(obj){
  return Object.values(obj)
}

function workTitle(works, workid, html){
  assert(works, "No works argument specified for workid " + workid)
  var strings = [
    workInfo (works, workid, "Name"),
    workInfo (works, workid, "Year")]
    if (!html){
      return strings.join(", ");
    } else {
      strings[0] = `<div class="workTitle workCaptionItem"><i>${strings[1]}</i></div>`
      strings[1] = `div class="workCaptionItem">${strings[i]}</div>`
      return `<div class="workCaption">${strings.join(", ")}</div>`;
    }
    
}

function workCaption(works, workid, short, html){
    assert(works, "No works argument specified for workid " + workid)

    var strings = [
       workInfo (works, workid, "Name"),
       workInfo (works, workid, "Year"),
       workInfo (works, workid, "Medium"),
       workInfo (works, workid, "Size"),
       workInfo (works, workid, "Description")]
    if (!short){
      strings.unshift(workInfo (works, workid, "Artists"));
    }
    strings = strings.filter(s=>s);
    if (!html){
      return strings.join(", ");
    } else {
      strings[1] = `<div class="workTitle workCaptionItem"><i>${strings[1]}</i></div>`
      for (var i = 2; i <= 5; i++){
        strings[i] = `div class="workCaptionItem">${strings[i]}</div>`
      }
      return `<div class="workCaption">${strings.join(", ")}</div>`;
    }
}

function videoURL(videoName){
  return `${videoName}/master.m3u8`  
}


module.exports = (eleventyConfig) => {

    if (process.env.ELEVENTY_URL) {
      eleventyConfig.baseURL = process.env.ELEVENTY_URL;
    }

    eleventyConfig.addPlugin(metagen);

     // get the current year to be placed in the footer
     eleventyConfig.addShortcode("getYear", function() {
        const year = new Date().getFullYear();
        return `${year}`;
    });

    eleventyConfig.addPassthroughCopy("static");
    //eleventyConfig.addPassthroughCopy({"projects/**/*.mp4": "v"})
    //eleventyConfig.addPassthroughCopy({"shows/**/*.mp4": "v"})
    eleventyConfig.addPassthroughCopy("titles/**/*.m3u8")
    eleventyConfig.addPassthroughCopy("titles/**/poster.jpg")
    eleventyConfig.addPassthroughCopy("titles/**/*.ts")
    eleventyConfig.addPassthroughCopy("shows/**/*.m3u8")
    eleventyConfig.addPassthroughCopy("shows/**/*.ts")
    eleventyConfig.addPassthroughCopy("titles/**/*.pdf")
    
    eleventyConfig.addPassthroughCopy("_redirects")
    eleventyConfig.addPassthroughCopy("robots.txt")
    //eleventyConfig.addPassthroughCopy({"shows/**/hls/*": "v"})


    eleventyConfig.addFilter("workInfo", workInfo);
    //eleventyConfig.addFilter("workCaption", workCaption);

    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addNunjucksAsyncShortcode("imagePoster", imagePoster);

    eleventyConfig.addNunjucksAsyncShortcode("imagelg", imageLightgalleryShortcode);
    eleventyConfig.addShortcode("basename", Path.basename )
    //eleventyConfig.addShortcode("workCaption", workCaption )
    eleventyConfig.addFilter("videoURL", videoURL )

    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);
    eleventyConfig.addNunjucksGlobal("valueArray", valueArray);
    eleventyConfig.addNunjucksGlobal("workCaption", workCaption);
    eleventyConfig.addNunjucksGlobal("workTitle", workTitle);



    eleventyConfig.addFilter("showDate", dateObj => {
      return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("L/yyyy");
    });

    eleventyConfig.addNunjucksAsyncShortcode("fotorama", fotoramaImage);

    eleventyConfig.addPlugin(embedInstagram);
    eleventyConfig.addPlugin(schema);

    
    eleventyConfig.addFilter("stripHTML", (post) => {
     return post.replace(/(<([^>]+)>)/gi, ""); 
    });
    
    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
      return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd')
    })
    eleventyConfig.addFilter('iso8601', (dateObj) => {
      return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toISO()
    })
    
    /*
    eleventyConfig.setBrowserSyncConfig({
      snippet: false,
    });*/
    
    const { minify } = require("terser");
    eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
      code,
      callback
    ) {
      try {
        const minified = await minify(code);
        callback(null, minified.code);
      } catch (err) {
        console.error("Terser error: ", err);
        // Fail gracefully.
        callback(null, code);
      }
    });
    
    eleventyConfig.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);
        
};

