!function(){
  //  改了url 地址 下面removeItem() 的地址也相改一下（remove 上一次url的名称）
    var url = "/img/sider/svg/svg-symbols.svg?ver=13";
    var div = document.createElement("div");
    div.style.display = "none";
    document.body.appendChild(div);
    // 载入SVG
    if (localStorage.getItem(url)) {
      // 本地获取，减少请求
      div.innerHTML = localStorage.getItem(url);
    } else {
      localStorage.removeItem("/img/sider/svg/svg-symbols.svg?ver=14");
      var xhr = new XMLHttpRequest();
      xhr.open("get", url);
      xhr.onload = function() {
        if (xhr.responseText) {
          div.innerHTML = xhr.responseText;
          // 本地存储
          localStorage.setItem(url, xhr.responseText);
        }
      };
      xhr.send(null);
    }
  }();