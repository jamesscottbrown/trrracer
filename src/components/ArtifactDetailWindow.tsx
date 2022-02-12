import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View } from "react-native";
import {
  Flex,
  Box,
  Button
} from '@chakra-ui/react';

interface DetailProps {
    selectedArtifact : string;
    setSelectedArtifact : (sa: string) => void; 
    setViewType: (view: string) => void;
}

const ArtifactDetailWindow = (props: DetailProps) => {
    const { selectedArtifact, setSelectedArtifact, setViewType } = props;

    console.log(selectedArtifact, setSelectedArtifact, setViewType)

    return(
        <div>
            <Button onClick={()=>{
                setSelectedArtifact("null");
                setViewType("activity view");

            }}>{"GO BACK"}</Button>
        </div>
    )
}

export default ArtifactDetailWindow;