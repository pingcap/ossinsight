package tidb

import (
	"fmt"
	"testing"
)

func TestQueryThisYearSumCount(t *testing.T) {
	result, err := QueryThisYearSumCount()
	if err != nil {
		t.Error(err)
	}

	fmt.Println(result)
}
