
export default async function wait(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, ms);
  });
}
