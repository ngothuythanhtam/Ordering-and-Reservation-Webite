<template>
  <header class="header">
    <div class="head">
      <div class="left-section">
        <div class="logo">
          <a href="/">
            <img src="../image-shop/logo.png" alt="Logo"/>
          </a>
        </div>
        <ul class="menu">
          <li class="menu-item">
            <a href="/iphone">IPHONE</a>
          </li>
          <li class="menu-item">
            <a href="/">MACBOOK</a>
          </li>
          <li class="menu-item">
            <a href="/">IPAD</a>
          </li>
          <li class="menu-item">
            <a href="/">APPLE WATCH</a>
          </li>
          <li class="menu-item">
            <a href="/">TAI NGHE,LOA</a>
          </li>
          <li class="menu-item">
            <a href="/">PHỤ KIỆN</a>
          </li>
        
        </ul>
      </div>
       <div class="search-cart">
        <div class="search input-group">
          <span class="input-group-text bg-white border-0">
            <i class="fas fa-search"></i>
          </span>
          <input 
            type="text" 
            class="form-control border-0" 
            placeholder="Tìm kiếm sản phẩm" 
          />
        </div>
        <a href="/cart" class="cart ms-3">
          <i class="fas fa-shopping-cart"></i>
          <span class="number badge bg-danger">0</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
}
</script>

<style scoped>
.header {
  background-color: black;
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  z-index: 1000;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 20px; /* Khoảng cách giữa logo và menu */
}

.logo img {
  max-height: 60px;
  height: auto;
  border-radius: 10px;
}

.menu {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-item a {
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  font-size: 1.1rem; /* Tăng kích thước chữ */
  font-weight: 500; /* Làm đậm chữ */
}

.menu-item a:hover {
  background-color: rgba(128, 128, 128, 0.5);
  border-radius: 5px;
}

.search-cart {
  display: flex;
  align-items: center;
  margin-left: auto; /* Đẩy về bên phải */
  gap: 20px; /* Khoảng cách giữa search và cart */
}

.search {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 20px;
  padding: 5px 15px;
}

.search input {
  border: none;
  padding: 8px;
  width: 200px;
  font-size: 1rem;
  outline: none;
}

.cart {
  color: white;
  text-decoration: none;
  position: relative;
  font-size: 1.2rem;
  padding: 5px;
}

.number {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.8rem;
  font-weight: bold;
}
</style>