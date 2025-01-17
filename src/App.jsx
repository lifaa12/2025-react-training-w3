import axios from "axios";
import Swal from 'sweetalert2';
import { useState } from "react";

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
  const [productDetail, setProductDetail] = useState({});
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
      const productRes = await axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`);
      setProductList(productRes.data.products);
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

  return (
    <>
      {isLoading ? <LoadingSpinner /> : null}
      {isAuth ? <>
        <div className="container py-5">
          <button type="button" className="btn btn-primary" onClick={logOut}>登出</button>
          <div className="row">
            {
              productList.map((item, idx) => {
                return (
                  <div className="col" key={item.id}>
                    <div className="card">
                      <div className="img-wrap">
                        <img src={item.imageUrl} className="card-img-top h-100" alt="product-img" />
                      </div>
                      <div className="card-body text-center">
                        <h5 className="card-title">{item.title}</h5>
                        <button type="button" className="btn btn-primary" onClick={() => { setProductDetail(item), setProductImgUrl(item.imageUrl) }}>查看更多</button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
          {
            productDetail.title ? (
              <>
                <div className="row mt-5">
                  <div className="col-4 mx-auto">
                    <div className="card">
                      <div className="img-wrap">
                        <img src={productImgUrl} className="card-img-top h-100" alt="product-img" />
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{productDetail.title}</h3>
                        <p className="card-text">{productDetail.description}</p>
                        <p>{productDetail.content}</p>
                        <p>售價：${productDetail.price}</p>
                        <div className="other-img">
                          <img src={productDetail.imageUrl} alt="product-img" className="product-sm-img mx-1 rounded-3" onClick={() => setProductImgUrl(productDetail.imageUrl)} />
                          {
                            productDetail.imagesUrl.map((item, idx) => {
                              return (
                                <img src={item} className="product-sm-img mx-1 rounded-3" alt="product-img" key={idx} onClick={() => setProductImgUrl(item)} />
                              )
                            })
                          }
                        </div>
                        <button className="mt-3 btn btn-primary" onClick={() => { setProductDetail({}) }}>關閉</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (<h1 className="text-center mt-5">請點選"查看更多"</h1>)
          }
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
          </div></>}
    </>
  )
}

export default App
