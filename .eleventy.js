const metagen = require('eleventy-plugin-metagen');
const Image = require("@11ty/eleventy-img");
const Path = require('path');
const { DateTime } = require("luxon");
const assert = require('assert')
const inspect = require("util").inspect;


const embedInstagram = require("eleventy-plugin-embed-instagram");


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


async function imageShortcode(src, alt, sizes = "100vw") {
  if(alt === undefined) {
    // You bet we throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
  }

  let metadata = await Image(src, {
    widths: [600, 1200, 1920, 3000],
    formats: ['jpeg'],
    outputDir: "./_site/img/"
  });

  let lowsrc = metadata.jpeg[0];
  
  let html = `<img 
        alt="${alt}"
        srcset="${metadata.jpeg.map(entry => entry.srcset).join(", ")}"
        sizes="${sizes}"
        src="${lowsrc.url}">`
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
        return "undefined";
      }

}

function workCaption(works, tags, image){
    assert(works, "No works argument specified.")
    assert(tags, "No tags element specified");
    assert(image, "No image specified");
    if (tags.includes('shows') && ! ('caption' in image)){
      let prefix = ('prefix' in image)?image.prefix:""
      return `<div class="workCaption">
      ${prefix}
      <div class="workTitle workCaptionItem"><i>${workInfo (works, image.workid, "Name")}</i></div>,
      <div class="workCaptionItem">${workInfo (works, image.workid, "Year")}</div>,
      <div class="workCaptionItem">${workInfo (works, image.workid, "Medium")}</div>,
      <div class="workCaptionItem">${workInfo (works, image.workid, "Size")}</div>
      </div>`
    } else {
      return ` <div class="workCaption">
              <div class="workCaptionItem">${image.caption}</div>
          </div>`
    }
}

function videoURL(videoName){
  return `${videoName}/master.m3u8`  
}


module.exports = (eleventyConfig) => {

    eleventyConfig.addPlugin(metagen);

     // get the current year to be placed in the footer
     eleventyConfig.addShortcode("getYear", function() {
        const year = new Date().getFullYear();
        return `${year}`;
    });

    eleventyConfig.addPassthroughCopy("static");
    //eleventyConfig.addPassthroughCopy({"projects/**/*.mp4": "v"})
    //eleventyConfig.addPassthroughCopy({"shows/**/*.mp4": "v"})
    eleventyConfig.addPassthroughCopy("projects/**/*.m3u8")
    eleventyConfig.addPassthroughCopy("projects/**/*.ts")
    eleventyConfig.addPassthroughCopy("shows/**/*.m3u8")
    eleventyConfig.addPassthroughCopy("shows/**/*.ts")
    eleventyConfig.addPassthroughCopy("projects/**/*.pdf")
    eleventyConfig.addPassthroughCopy("shows/**/*.pdf")

    //eleventyConfig.addPassthroughCopy({"shows/**/hls/*": "v"})


    eleventyConfig.addFilter("workInfo", workInfo);
    eleventyConfig.addFilter("workCaption", workCaption);

    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addNunjucksAsyncShortcode("imagePoster", imagePoster);

    eleventyConfig.addNunjucksAsyncShortcode("imagelg", imageLightgalleryShortcode);
    eleventyConfig.addShortcode("basename", Path.basename )
    eleventyConfig.addShortcode("workCaption", workCaption )
    eleventyConfig.addFilter("videoURL", videoURL )

    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);

    eleventyConfig.addFilter("showDate", dateObj => {
      return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("L/yyyy");
    });

    eleventyConfig.addNunjucksAsyncShortcode("fotorama", fotoramaImage);

    eleventyConfig.addPlugin(embedInstagram);
    
    eleventyConfig.addFilter("stripHTML", (post) => {
     return post.replace(/(<([^>]+)>)/gi, ""); 
    });
    
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

