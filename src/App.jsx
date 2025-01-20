import axios from "axios";
import Swal from 'sweetalert2';
import { useEffect, useRef, useState } from "react";
import { Modal } from 'bootstrap';


const apiUrl = import.meta.env.VITE_BASE_URL;
const apiPath = import.meta.env.VITE_API_PATH;

const LoadingSpinner = () => {
  return (
    <>
      <div className="spinner position-fixed top-50 start-50 zx-99">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  )
}

function App() {
  const [user, setUser] = useState({ username: "", password: "" });
  const [isAuth, setIsAuth] = useState(false);
  const [productList, setProductList] = useState([]);
  const [productDetail, setProductDetail] = useState({ imagesUrl: [] });
  const [productImgUrl, setProductImgUrl] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value
    });
  };

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      login();
    };
  };

  const getProduct = async () => {
    try {
      const productRes = await axios.get(`${apiUrl}/v2/api/${apiPath}/admin/products`);
      setProductList(productRes.data.products);
    } catch (error) {
      console.log(error);
    };
  };

  const login = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${apiUrl}/v2/admin/signin`, user);
      const { expired, token } = res.data;
      document.cookie = `userToken = ${token}; expires = ${new Date(expired)}`;
      axios.defaults.headers.common['Authorization'] = token;
      loginCheck();
    } catch (error) {
      Swal.fire({
        title: error.response.data.message,
        text: error.response.data.error.message,
        icon: "error"
      });
      setIsLoading(false);
    };
  };
  const loginCheck = async () => {
    try {
      const res = await axios.post(`${apiUrl}/v2/api/user/check`);
      Swal.fire({
        title: "歡迎回來！",
        icon: "success"
      });
      getProduct();
      setUser({ username: "", password: "" });
      setIsAuth(true);
      setIsLoading(false);
    } catch (error) {
      Swal.fire({
        title: error.response.data.message,
        icon: "error"
      });
    };
  };
  const logOut = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${apiUrl}/v2/logout`);
      Swal.fire({
        title: "您已成功登出！",
        icon: "success"
      });
      document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      delete axios.defaults.headers.common['Authorization'];
      setIsAuth(false);
      setProductDetail({});
      setIsLoading(false);
    } catch (error) {
      Swal.fire({
        title: error.response.data.message,
        icon: "error"
      });
    };
  };

  // 詳細資訊
  const productModalRef = useRef(null);
  const productModalMethodRef = useRef(null);
  useEffect(() => {
    productModalMethodRef.current = new Modal(productModalRef.current)
  }, []);
  const detailModalOpen = () => {
    productModalMethodRef.current.show();
  };
  const detailModalClose = () => {
    productModalMethodRef.current.hide();
  };

  // 新增產品/編輯
  const editProductRef = useRef(null);
  const editProductMethodRef = useRef(null);
  useEffect(() => {
    editProductMethodRef.current = new Modal(editProductRef.current)
  }, []);
  const productEditModalOpen = () => {

    editProductMethodRef.current.show();
  };
  const productEditModalClose = () => {
    editProductMethodRef.current.hide();
  };
  const [productValue, setProductValue] = useState({
    title: "",
    origin_price: "",
    content: "",
    category: "",
    price: "",
    unit: "",
    description: "",
    is_enabled: "",
    imageUrl: "",
    imagesUrl: []
  });
  const handleProductInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setProductValue({
      ...productValue,
      [name]: type === "checkbox" ? checked : value
    });
  };
  const handleProductImgInputChange = (e, idx) => {
    const imgArr = [...productValue.imagesUrl];
    imgArr[idx] = e.target.value;
    setProductValue({ ...productValue, imagesUrl: imgArr });
  };
  const [mode, setMode] = useState("");
  const productEdit_Add = async (id) => {
    try {
      setIsLoading(true);
      const url = mode === "edit" ? `${apiUrl}/v2/api/${apiPath}/admin/product/${id}` : `${apiUrl}/v2/api/${apiPath}/admin/product`;
      let res;
      if (mode === "edit") {
        res = await axios.put(url, {
          data: {
            ...productValue,
            origin_price: Number(productValue.origin_price),
            price: Number(productValue.price)
          }
        });
      } else {
        res = await axios.post(url, {
          data: {
            ...productValue,
            origin_price: Number(productValue.origin_price),
            price: Number(productValue.price),
          }
        });
      }
      getProduct();
      Swal.fire({
        title: mode === "edit" ? "修改完成！" : "新增成功！",
        icon: "success"
      });
      setIsLoading(false);
      productEditModalClose();
    } catch (error) {
      Swal.fire({
        title: error.response.data.message,
        icon: "error"
      });
      setIsLoading(false);
    };
  };

  // 刪除產品
  const productDelete = async (id) => {
    try {
      setIsLoading(true);
      const res = await axios.delete(`${apiUrl}/v2/api/${apiPath}/admin/product/${id}`)
      getProduct();
      Swal.fire({
        title: "刪除成功！",
        icon: "success"
      });
      setIsLoading(false);
    } catch (error) {
      Swal.fire({
        title: error.response.data.message,
        icon: "error"
      });
      setIsLoading(false);
    };
  };

  return (
    <>
      {isLoading ? <LoadingSpinner /> : null}
      {isAuth ? <>
        <div className="container py-5">
          <button type="button" className="btn btn-primary me-3" onClick={logOut}>登出</button>
          <button type="button" className="btn btn-success" onClick={() => {
            setMode("add");
            setProductValue({
              title: "",
              origin_price: "",
              content: "",
              category: "",
              price: "",
              unit: "",
              description: "",
              is_enabled: "",
              imageUrl: "",
              imagesUrl: []
            })
            productEditModalOpen();
          }} >新增產品</button>
          <div className="container">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">編號</th>
                  <th scope="col">品名</th>
                  <th scope="col">類別</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">狀態</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              {
                productList.map((item, idx) => {
                  return (
                    <tbody key={item.id}>
                      <tr>
                        <th scope="row">{idx + 1}</th>
                        <td>{item.title}</td>
                        <td>{item.category}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? <span className="text-success">啟用</span> : <span className="text-danger">未啟用</span>}</td>
                        <td>
                          <button type="button" className="btn btn-info me-3" onClick={() => { setProductDetail(item), setProductImgUrl(item.imageUrl), detailModalOpen() }}>詳細資訊</button>
                          <button type="button" className="btn btn-primary me-3" onClick={() => {
                            setMode("edit");
                            setProductValue(item);
                            productEditModalOpen();
                          }}>編輯</button>
                          <button type="button" className="btn btn-danger" onClick={() => productDelete(item.id)} >刪除</button>
                        </td>
                      </tr>
                    </tbody>
                  )
                })
              }
            </table>
          </div>
        </div>
      </> :
        <>
          {isLoading ? <LoadingSpinner /> : null}
          <div className="container">
            <div className="row">
              <div className="col-6 mx-auto my-5">
                <h1 className="text-center">登入</h1>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">電子信箱</label>
                  <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" name="username" value={user.username} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputPassword1" className="form-label">密碼</label>
                  <input type="password" className="form-control" id="exampleInputPassword1" name="password" value={user.password} onChange={handleInputChange} onKeyDown={handleKeyDown} />
                </div>
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary" onClick={login}>登入</button>
                </div>
              </div>
            </div>
          </div>
        </>}

      <div className="modal fade" ref={productModalRef} tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">{productDetail.title}</h1>
              <button type="button" className="btn-close" onClick={detailModalClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="card">
                <img src={productImgUrl} className="card-img-top img-wrap" alt="product-img" />
                <div className="d-flex mt-3">
                  <img src={productDetail.imageUrl} className="product-sm-img mx-1 rounded-3" alt="product-img" onClick={() => setProductImgUrl(productDetail.imageUrl)} />
                  {productDetail.imagesUrl ?
                    productDetail.imagesUrl.map((item, idx) => {
                      return (
                        <img src={item} className="product-sm-img mx-1 rounded-3" alt="product-img" key={idx} onClick={() => setProductImgUrl(item)} />
                      )
                    }) : null
                  }
                </div>
                <div className="card-body">
                  <h5 className="card-title">售價：${productDetail.price}</h5>
                  <p className="card-text">{productDetail.description}</p>
                  <p className="card-text">{productDetail.content}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={detailModalClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" ref={editProductRef} tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        {isLoading ? <LoadingSpinner /> : null}
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{mode === "edit" ? "編輯產品" : "新增產品"}</h5>
              <button type="button" className="btn-close" onClick={productEditModalClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {
                <form>
                  <div className="d-flex justify-content-between">
                    <div className="w-50 pe-1">
                      <div className="mb-3">
                        <label htmlFor="productTitle" className="form-label">品名</label>
                        <input type="text" className="form-control" id="productTitle" value={productValue.title} name="title" onChange={handleProductInputChange} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="productOriginPrice" className="form-label">原價</label>
                        <input type="number" className="form-control" id="productOriginPrice" value={productValue.origin_price} name="origin_price" onChange={handleProductInputChange} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="productContent" className="form-label">尺寸</label>
                        <input type="text" className="form-control" id="productContent" value={productValue.content} name="content" onChange={handleProductInputChange} />
                      </div>
                    </div>
                    <div className="w-50 ps-1">
                      <div className="mb-3">
                        <label htmlFor="productCategory" className="form-label">類別</label>
                        <input type="text" className="form-control" id="productCategory" value={productValue.category} name="category" onChange={handleProductInputChange} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="productPrice" className="form-label">售價</label>
                        <input type="number" className="form-control" id="productPrice" value={productValue.price} name="price" onChange={handleProductInputChange} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="productUnit" className="form-label">單位</label>
                        <input type="text" className="form-control" id="productUnit" value={productValue.unit} name="unit" onChange={handleProductInputChange} />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productDescription" className="form-label">產品描述</label>
                    <textarea type="text" className="form-control" id="productDescription" value={productValue.description} name="description" onChange={handleProductInputChange} />
                  </div>
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="exampleCheck1" checked={productValue.is_enabled ? true : false} name="is_enabled" onChange={handleProductInputChange} />
                    <label className="form-check-label" htmlFor="exampleCheck1">{productValue.is_enabled ? "啟用" : "未啟用"}</label>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImageUrl" className="form-label">主圖網址</label>
                    <input type="text" className="form-control" id="productImageUrl" value={productValue.imageUrl} name="imageUrl" onChange={handleProductInputChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImagesUrl1" className="form-label">副圖網址-1</label>
                    <input type="text" className="form-control" id="productImagesUrl1" value={productValue.imagesUrl[0] || ""} onChange={(e) => handleProductImgInputChange(e, 0)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImagesUrl2" className="form-label">副圖網址-2</label>
                    <input type="text" className="form-control" id="productImagesUrl2" value={productValue.imagesUrl[1] || ""} onChange={(e) => handleProductImgInputChange(e, 1)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImagesUrl3" className="form-label">副圖網址-3</label>
                    <input type="text" className="form-control" id="productImagesUrl3" value={productValue.imagesUrl[2] || ""} onChange={(e) => handleProductImgInputChange(e, 2)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImagesUrl4" className="form-label">副圖網址-4</label>
                    <input type="text" className="form-control" id="productImagesUrl4" value={productValue.imagesUrl[3] || ""} onChange={(e) => handleProductImgInputChange(e, 3)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImagesUrl5" className="form-label">副圖網址-5</label>
                    <input type="text" className="form-control" id="productImagesUrl5" value={productValue.imagesUrl[4] || ""} onChange={(e) => handleProductImgInputChange(e, 4)} />
                  </div>
                </form>
              }
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => productEdit_Add(productValue.id)}>{mode === "edit" ? "儲存" : "新增"}</button>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default App
