package com.sneakerstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendChatMessageRequest {

    @NotBlank(message = "content không được để trống")
    @Size(
            max = 2000,
            message = "content không được vượt quá 2000 ký tự"
    )
    private String content;
}