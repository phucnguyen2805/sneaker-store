package com.sneakerstore.dto;

import com.sneakerstore.entity.ChatConversationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatConversationRequest {

    @NotNull(message = "type không được để trống")
    private ChatConversationType type;
}