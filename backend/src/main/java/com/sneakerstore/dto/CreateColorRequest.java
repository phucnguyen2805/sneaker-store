package com.sneakerstore.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateColorRequest {

    private String name;

    private String hexCode;
}