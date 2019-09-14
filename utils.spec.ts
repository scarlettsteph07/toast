// import { expect } from 'chai';
// import { eventWrapper } from './utils';

// import {
//   GetNewRecipeFunc,
// } from './types';

// describe('utils', () => {
//   describe ('#eventWrapper', () => {
//     it('should return a json body', async () => {
//       const testFunc: GetNewRecipeFunc = async (event, dynamoClient) => {
//         const payload = { event, dynamoClient };
//         return new Promise((resolve, reject) => {
//           resolve([{
//             name: 'name',
//             required: false,
//             style: 'style',
//           }]);
//         });
//       };
//       const output = await eventWrapper(testFunc);
//       expect(output).to.be.equal(true);
//     });
//   });
// });
