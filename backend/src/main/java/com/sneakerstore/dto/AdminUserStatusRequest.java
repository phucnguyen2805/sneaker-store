package com.sneakerstore.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminUserStatusRequest {

    /*
     * true  -> mở khóa / cho phép đăng nhập
     * false -> khóa tài khoản / không cho phép đăng nhập
     */
    private Boolean enabled;
}