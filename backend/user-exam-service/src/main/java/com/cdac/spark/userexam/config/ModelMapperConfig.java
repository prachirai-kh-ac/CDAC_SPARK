package com.cdac.spark.userexam.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean // method level annotation - to declare a method returning java object
    public ModelMapper modelMapper() {  // 3rd party libraray used to the  mapping 
        ModelMapper mapper = new ModelMapper();
        // configure mapper - to transfer the matching props (name + data type)
        mapper.getConfiguration().setMatchingStrategy(org.modelmapper.convention.MatchingStrategies.STRICT)
                // configure mapper - not to transfer nulls from src -> dest
                .setPropertyCondition(org.modelmapper.Conditions.isNotNull());
        return mapper;
    }
}
