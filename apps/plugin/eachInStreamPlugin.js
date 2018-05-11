
/*module.exports = eachInStreamPlugin(schema, options) => {
   schema.method('eachInStream', (stream, handler) => {
     return new Promise((resolve, reject) => {
       stream.on('data', doc => {
         stream.pause();
         handler(doc).then(res => stream.resume()).catch(reject);
       }).on('error', reject).on('end', resolve);
     });
   });
};
*/
