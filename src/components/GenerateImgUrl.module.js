function GenerateImgUrl(s_num, f_num) {
  const s3Url = `https://foodineye2.s3.ap-northeast-2.amazonaws.com/screen_image/`;
  let imgKey = "";

  const storeFoodKeys = {
    store0: ["96dc63e5-1dae-4d1b-ad49-d545397fef58.jpg"],
    store1: [
      "2701ddc2-5f5f-4c31-ad31-b4bda646f4e9.jpg",
      "e600c7f5-94dc-4c83-88ce-0a2e26499a6b.jpg",
      "c66c7035-1724-474f-a9a5-7c0b81a8fb5e.jpg",
      "ea972fd4-03e9-49da-b2b3-c41d278a36d2.jpg",
      "097dd904-2eba-4061-bea9-34030a60719c.jpg",
      "f01783bf-59b8-436b-a91a-76a1fa7d4d6c.jpg",
      "edc1bbb6-c1a5-49af-ad6e-de8c4f2a0b24.jpg",
      "60a8ae34-a98b-4041-9a9e-ba6f4fe6d39a.jpg",
    ],
    store2: [
      "426e4b55-d435-48a5-8e3b-a10c9cec021c.jpg",
      "6b116e6e-3b85-41c1-9204-79c753c26bc1.jpg",
      "7a0097d3-e7cb-48fd-b5bf-3180fba7faad.jpg",
      "8512c5f8-2750-4851-8aed-281a674da989.jpg",
      "6e6d0f57-7bef-4d75-9c2a-0ed0cd419940.jpg",
      "4428f5ff-43ba-48f0-ab44-d3fc4359fcce.jpg",
      "08a906f8-58f1-4c2f-8a35-e97fab9ab7fa.jpg",
      "0b074fc5-1b89-45a4-88b5-8ba1262a85dc.jpg",
      "b08075e2-cea8-4715-aa6d-b8a5e454103a.jpg",
    ],
    store3: [
      "0e2ee6ce-5622-4e03-a2d8-6387c0e191dc.jpg",
      "c77ed31a-a008-42e4-a82a-441ca84285a4.jpg",
      "baf54829-cf56-4466-b9a7-e40a34dfe80f.jpg",
      "3fc5cbb4-585d-4b6b-9303-04f4f17a3525.jpg",
      "17059e10-038b-4e00-9b4e-dece579c9af5.jpg",
      "5c539408-15d7-4e87-80c6-6c36f954d3d9.jpg",
      "9d549ea4-cb7d-46a2-9ed2-32b4b7ce40df.jpg",
    ],
    store4: [
      "95ebde9b-a0ed-4789-9812-4670083f2d1e.jpg",
      "12dce916-319f-4004-9ebc-78eff0243939.jpg",
      "873ac286-153b-4ae1-a564-8b117fe0ac1d.jpg",
      "67ed3b9e-8e56-471f-a0bd-fdca946a16ad.jpg",
      "fb90d905-65be-4863-bcdd-35aaf02942b2.jpg",
      "5a3dc50f-0202-4a63-ac1c-530a25c3888d.jpg",
      "544fb103-d016-4b53-bb49-0773c03147a2.jpg",
    ],
    store5: [
      "77d577e1-428b-466e-be7e-3cfe35fa0359.jpg",
      "5e97bcbf-3225-4647-834a-b8921784b327.jpg",
      "d63b1f06-c1d5-411f-8f59-734fa75ee857.jpg",
      "5902b33b-c89b-4e1a-8f42-caf444aeab7b.jpg",
      "b2b106d0-60ed-4164-929c-028574786071.jpg",
    ],
  };

  if (s_num === 0) {
    imgKey = storeFoodKeys.store0[0];
  } else if (s_num === 1) {
    /** 하울 */
    if (f_num === 0) {
      imgKey = storeFoodKeys.store1[0];
    }
    for (let i = 1; i <= storeFoodKeys.store1.length; i++) {
      if (f_num === i) {
        imgKey = storeFoodKeys.store1[i];
      }
    }
  } else if (s_num === 2) {
    /** 파스타 */
    if (f_num === 0) {
      imgKey = storeFoodKeys.store2[0];
    }
    for (let i = 1; i <= storeFoodKeys.store2.length; i++) {
      if (f_num === i) {
        imgKey = storeFoodKeys.store2[i];
      }
    }
  } else if (s_num === 3) {
    /** 비빔밥 */
    if (f_num === 0) {
      imgKey = storeFoodKeys.store3[0];
    }
    for (let i = 1; i <= storeFoodKeys.store3.length; i++) {
      if (f_num === i) {
        imgKey = storeFoodKeys.store3[i];
      }
    }
  } else if (s_num === 4) {
    /** 해장국 */
    if (f_num === 0) {
      imgKey = storeFoodKeys.store4[0];
    }
    for (let i = 1; i <= storeFoodKeys.store4.length; i++) {
      if (f_num === i) {
        imgKey = storeFoodKeys.store4[i];
      }
    }
  } else if (s_num === 5) {
    /** 니나노 */
    if (f_num === 0) {
      imgKey = storeFoodKeys.store5[0];
    }
    for (let i = 1; i <= storeFoodKeys.store5.length; i++) {
      if (f_num === i) {
        imgKey = storeFoodKeys.store5[i];
      }
    }
  }

  return `${s3Url}${imgKey}`;
}

export default GenerateImgUrl;
