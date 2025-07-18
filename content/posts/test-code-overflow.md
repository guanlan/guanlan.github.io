---
title: "Test Code Overflow Fix"
date: 2024-01-15T10:00:00+08:00
draft: false
tags: ["test"]
---

This is a test page to demonstrate that the code block overflow issue has been fixed.

## Test with a very long line of code

Here's a code block with a very long line that would normally overflow:

```python
def this_is_a_very_long_function_with_a_very_long_name_that_would_normally_cause_horizontal_overflow_in_the_code_block(parameter1_with_long_name, parameter2_with_long_name, parameter3_with_long_name, parameter4_with_long_name):
    """This is a docstring with a very long line that demonstrates the horizontal scrolling functionality of the code block when lines are too long to fit in the viewport"""
    very_long_variable_name_that_makes_the_line_even_longer = "This is a string with a very long value that extends far beyond the normal width of the code block container"
    return very_long_variable_name_that_makes_the_line_even_longer + " and even more text to make it longer"
```

## Test with wide table-like code

```javascript
const veryLongObjectWithManyPropertiesThatWouldCauseOverflow = {
    propertyWithVeryLongName1: "value that is also quite long to demonstrate the issue",
    propertyWithVeryLongName2: "another value that is also quite long to demonstrate the issue",
    propertyWithVeryLongName3: "yet another value that is also quite long to demonstrate the issue",
    propertyWithVeryLongName4: "and one more value that is also quite long to demonstrate the issue"
};
```

## Test with long command

```bash
docker run --name my-container-with-very-long-name -p 8080:8080 -e ENVIRONMENT_VARIABLE_WITH_LONG_NAME=value -e ANOTHER_ENVIRONMENT_VARIABLE_WITH_LONG_NAME=another-value -v /very/long/path/to/local/directory:/very/long/path/to/container/directory:ro my-image-with-very-long-name:latest
```

If the fix is working correctly, all these code blocks should:
1. Have horizontal scrollbars when the content is wider than the container
2. Not cause the entire page to overflow horizontally
3. Keep line numbers sticky on the left when scrolling horizontally
