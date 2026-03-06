package risingwave

import (
	"fmt"
	"testing"
)

func TestGetAddAndDelLanguageMapBySecond(t *testing.T) {
	addMap, delMap, err := GetAddAndDelLanguageMap()
	if err != nil {
		t.Error(err)
	}

	fmt.Println("--- add map ---")
	for k, v := range addMap {
		fmt.Println(k, v)
	}

	fmt.Println("--- del map ---")
	for k, v := range delMap {
		fmt.Println(k, v)
	}
}

func TestGetLatestHourLanguageMap(t *testing.T) {
	languageMap, err := GetLatestHourLanguageMap()
	if err != nil {
		t.Error(err)
	}

	fmt.Println("--- language map ---")
	for k, v := range languageMap {
		fmt.Println(k, v)
	}
}
